import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradingResult, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the structured output of the grading process
const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "The name of the student extracted from the script, or 'Unknown Student'" },
    totalScore: { type: Type.NUMBER, description: "The sum of points awarded" },
    maxTotalScore: { type: Type.NUMBER, description: "The total possible points" },
    summaryFeedback: { type: Type.STRING, description: "Overall feedback for the student performance" },
    transcription: { type: Type.STRING, description: "The full verbatim transcription of the handwritten student script." },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING, description: "Question number or identifier" },
          score: { type: Type.NUMBER, description: "Points awarded for this question" },
          maxScore: { type: Type.NUMBER, description: "Max points for this question" },
          feedback: { type: Type.STRING, description: "Specific feedback explaining the score" },
        },
        required: ["questionId", "score", "maxScore", "feedback"]
      }
    }
  },
  required: ["studentName", "totalScore", "maxTotalScore", "summaryFeedback", "transcription", "breakdown"]
};

export const gradeStudentScript = async (
  scriptBase64: string,
  rubricData: string,
  isRubricFile: boolean
): Promise<GradingResult> => {
  try {
    const parts = [];

    // 1. Add System Instruction
    parts.push({
      text: `You are an expert AI Grading Assistant with advanced handwriting recognition capabilities. 
      
      Task 1: Transcription
      - Accurately transcribe the handwritten answers from the 'Student Script' PDF provided below.
      
      Task 2: Evaluation
      - Grade the transcribed answers strictly based on the provided Rubric.
      - If the Rubric is a PDF, extract the criteria from it first.
      - Provide constructive feedback.
      `
    });

    // 2. Add Student Script
    parts.push({
      text: "--- STUDENT SCRIPT (Handwritten) ---"
    });
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: scriptBase64
      }
    });

    // 3. Add Rubric (Text or PDF)
    parts.push({
      text: "--- RUBRIC / ANSWER KEY ---"
    });
    
    if (isRubricFile) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: rubricData
        }
      });
    } else {
      parts.push({
        text: rubricData
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Increased budget for transcription + grading
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GradingResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Grading failed:", error);
    throw error;
  }
};

// Chat for the Grading Assistant Context
export const sendGradingChatMessage = async (
  history: ChatMessage[],
  newMessage: string,
  contextData: { rubric: string; gradingResult: GradingResult | null }
): Promise<string> => {
  try {
    const systemPrompt = `You are a helpful teaching assistant. 
    Context:
    - You are discussing a student's graded assessment.
    - Student Transcription: ${contextData.gradingResult?.transcription.substring(0, 1000)}...
    - Student Performance: ${JSON.stringify(contextData.gradingResult)}
    
    Roles:
    1. Grading Assistant: Explain why a specific mark was given if asked.
    2. Teaching Assistant: Suggest teaching strategies based on the student's errors.
    `;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash", 
      config: {
        systemInstruction: systemPrompt,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Grading Chat error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

// Chat for the General Teaching Assistant (Syllabus/Research)
export const sendTeachingAssistantMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<{ text: string; groundingChunks: any[] }> => {
  try {
    const systemPrompt = `You are ChatX, an expert AI Teaching Assistant trained on NCERT, NEP 2020, and best pedagogical practices. 
    Your goal is to help teachers with syllabus planning, research, and creating educational content.
    You MUST use Google Search to provide up-to-date, factual information when asked about topics, curriculum standards, or recent events.
    Always cite your sources implicitly by using the search tool, and I will display the links.`;

    const chatContents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    chatContents.push({ role: 'user', parts: [{ text: newMessage }]});

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }]
      }
    });
    
    return {
      text: response.text || "No response generated.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Teaching Chat error:", error);
    return { text: "Sorry, I am unable to connect to the knowledge base right now.", groundingChunks: [] };
  }
};

// PlanX: Generate Lesson Plan
export const generateLessonPlan = async (
  topic: string,
  grade: string,
  language: string,
  context: string
): Promise<string> => {
  try {
    const prompt = `Create a comprehensive, culturally-relevant lesson plan for the following:
    Topic: ${topic}
    Grade Level: ${grade}
    Language: ${language}
    Cultural Context: ${context}

    Structure:
    1. Learning Objectives
    2. Materials Needed
    3. Introduction (Hook)
    4. Activity/Instruction
    5. Assessment/Conclusion
    6. Homework
    
    Keep it engaging and suitable for the Indian education context (CBSE/ICSE/State Board). Use Markdown for formatting. Use **bold** for headers and key terms.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Failed to generate lesson plan.";
  } catch (error) {
    console.error("PlanX error:", error);
    return "An error occurred while generating the plan.";
  }
};

// PulseX: Generate Student Feedback
export const generateStudentFeedback = async (
  studentName: string,
  topic: string
): Promise<string> => {
  try {
    const prompt = `Generate personalized feedback for a student named ${studentName} who struggled with the topic "${topic}".
    
    Provide:
    1. Encouragement.
    2. A simple explanation of the concept they likely missed.
    3. A practice exercise suggestion.
    
    Format:
    - Use **Markdown**.
    - Use **bold** for key concepts.
    - IMPORTANT: Enclose ALL mathematical symbols, equations, and numbers in dollar signs ($) for proper rendering (e.g., $x^2$, $2+2=4$, $1/2$).
    - Keep the tone supportive and constructive.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Failed to generate feedback.";
  } catch (error) {
    console.error("PulseX error:", error);
    return "An error occurred while generating feedback.";
  }
};

// PulseX: Generate Class Level Feedback
export const generateClassFeedback = async (
  grade: string,
  subject: string,
  topic: string,
  notes: string
): Promise<string> => {
  try {
    const prompt = `Generate a comprehensive Class-Level Feedback Report.
    Grade: ${grade}
    Subject: ${subject}
    Topic: ${topic}
    Teacher Observations: ${notes}

    Structure:
    1. General Observations (Strengths & Weaknesses)
    2. Common Misconceptions identified
    3. Remedial Action Plan for the Teacher (Activity or Review Strategy)
    4. Suggested Homework Adjustment
    
    Format:
    - Use **Markdown**.
    - Use **bold** for headers.
    - IMPORTANT: Enclose ALL mathematical symbols and equations in dollar signs ($) (e.g., $E=mc^2$).
    - Tone: Professional, Pedagogical, Action-Oriented.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Failed to generate class feedback.";
  } catch (error) {
    console.error("PulseX Class Feedback error:", error);
    return "An error occurred while generating class feedback.";
  }
};

// PulseX: Generate Adaptive Worksheet
export const generateAdaptiveWorksheet = async (
  studentName: string,
  topic: string,
  errorType: string,
  errorDetails: string
): Promise<string> => {
  try {
    const prompt = `Create a personalized adaptive worksheet for a student.
    Student Name: ${studentName}
    Topic: ${topic}
    Primary Error: ${errorType}
    Details: ${errorDetails}

    The worksheet should be in Markdown format.
    
    Part 1: Worksheet Content
    1. A header with the Student Name and Topic.
    2. "Concept Review": A brief, simple explanation addressing the specific error type.
    3. "Guided Practice": One solved example showing the correct method.
    4. "Your Turn": 5 practice questions starting easy and getting slightly harder. Do NOT include answers here.

    Part 2: Separator
    Insert a line with exactly: "---ANSWER KEY---"

    Part 3: Answer Key
    Start with a header: "# Answer Key"
    1. Detailed solutions for the "Your Turn" questions.

    Formatting Rules:
    - Use headers (#, ##).
    - Use numbered lists for questions.
    - IMPORTANT: Enclose ALL mathematical equations, variables, and numbers in dollar signs ($) for proper rendering (e.g., $x$, $y$, $2+2=4$, $\\frac{1}{2}$).
    - Use **bold** for emphasized text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Failed to generate worksheet.";
  } catch (error) {
    console.error("PulseX Worksheet error:", error);
    return "An error occurred while generating the worksheet.";
  }
};