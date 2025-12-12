import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Student } from '../types';
import { generateStudentFeedback, generateAdaptiveWorksheet, generateClassFeedback } from '../services/geminiService';
import { User, BookOpen, ChevronRight, RefreshCw, Printer, Sparkles, Users, FileText, Share2, Mail, FileDown } from 'lucide-react';

// Expanded Mock Data (10 Students)
const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Priya Patel', topic: 'The Indian Rebellion of 1857', status: 'Pending' },
  { id: '2', name: 'Aarav Sharma', topic: 'Algebraic Equations', status: 'Pending' },
  { id: '3', name: 'Rohan Mehta', topic: 'Photosynthesis', status: 'Pending' },
  { id: '4', name: 'Ananya Gupta', topic: 'Linear Equations', status: 'Pending' },
  { id: '5', name: 'Vikram Singh', topic: 'The Solar System', status: 'Pending' },
  { id: '6', name: 'Ishaan Kumar', topic: 'Parts of Speech', status: 'Pending' },
  { id: '7', name: 'Sana Khan', topic: 'Water Cycle', status: 'Pending' },
  { id: '8', name: 'Dev Reddy', topic: 'Mughal Empire', status: 'Pending' },
  { id: '9', name: 'Mira Nair', topic: 'Fractions & Decimals', status: 'Pending' },
  { id: '10', name: 'Kabir Das', topic: 'Force and Motion', status: 'Pending' },
];

const ERROR_TYPES = [
  'Conceptual Misunderstanding',
  'Calculation Error',
  'Procedural Error',
  'Recall Error',
  'Application Error'
];

// Custom Markdown Renderer Component
const parseInline = (text: string, mode: 'feedback' | 'worksheet') => {
  // Regex to split by $...$ (math) and **...** (bold)
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1);
      if (mode === 'worksheet') {
        return <span key={index} className="font-serif italic font-medium mx-1 text-lg">{math}</span>;
      } else {
        return <span key={index} className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-sm mx-1 border border-indigo-100">{math}</span>;
      }
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className={mode === 'worksheet' ? 'font-bold' : 'font-semibold text-indigo-900'}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const FormattedContent: React.FC<{ content: string, mode: 'feedback' | 'worksheet' }> = ({ content, mode }) => {
  const lines = content.split('\n');
  return (
    <div className={`space-y-2 ${mode === 'worksheet' ? 'font-serif text-black' : 'font-sans text-gray-800'}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        
        // Headers
        if (trimmed.startsWith('#')) {
           const match = trimmed.match(/^#+/);
           const level = match ? match[0].length : 1;
           const text = trimmed.replace(/^#+\s*/, '');
           const HeaderTag = (level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3') as 'h1' | 'h2' | 'h3';
           
           let className = '';
           if (mode === 'worksheet') {
             className = level === 1 ? 'text-xl font-bold uppercase border-b-2 border-black pb-2 mt-6 font-sans' 
                       : level === 2 ? 'text-lg font-bold mt-4 font-sans uppercase' 
                       : 'text-base font-bold mt-2 font-sans underline';
           } else {
             className = level === 1 ? 'text-xl font-bold text-indigo-800 mt-4' 
                       : level === 2 ? 'text-lg font-semibold text-indigo-700 mt-3' 
                       : 'text-base font-medium text-indigo-600 mt-2';
           }
           return React.createElement(HeaderTag, { key: i, className }, parseInline(text, mode));
        }
        
        // Numbered Lists
        if (trimmed.match(/^\d+\./)) {
           const number = trimmed.split('.')[0];
           return (
             <div key={i} className={`flex gap-3 mb-3 ${mode === 'worksheet' ? 'pl-2' : ''}`}>
               <span className="font-bold">{number}.</span>
               <div className="flex-1">{parseInline(trimmed.replace(/^\d+\.\s*/, ''), mode)}</div>
             </div>
           );
        }
        
        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
           return (
             <div key={i} className="flex gap-2 ml-4 mb-2">
               <span className={mode === 'feedback' ? 'text-indigo-500' : 'text-black'}>•</span>
               <div className="flex-1">{parseInline(trimmed.replace(/^[-*]\s*/, ''), mode)}</div>
             </div>
           );
        }

        return <p key={i} className={mode === 'worksheet' ? 'mb-4 leading-loose' : 'mb-2 leading-relaxed'}>{parseInline(line, mode)}</p>;
      })}
    </div>
  );
};

export const PulseX: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'worksheets'>('feedback');
  
  // Feedback Sub-State
  const [feedbackMode, setFeedbackMode] = useState<'individual' | 'class'>('individual');
  
  // Individual Feedback State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  
  // Class Feedback State
  const [classData, setClassData] = useState({
    grade: '5th Grade',
    subject: 'Science',
    topic: 'Photosynthesis',
    notes: 'Many students confused the inputs and outputs of the process.'
  });
  const [classFeedback, setClassFeedback] = useState<string>('');

  // Worksheet State
  const [worksheetData, setWorksheetData] = useState({
    studentName: 'Rohan Mehta',
    topic: 'Fractions',
    errorType: '',
    errorDetails: 'Student struggles with adding fractions with different denominators.'
  });
  const [generatedWorksheet, setGeneratedWorksheet] = useState('');
  const [worksheetView, setWorksheetView] = useState<'questions' | 'answers'>('questions');
  const [isWorksheetShareOpen, setIsWorksheetShareOpen] = useState(false);
  const worksheetShareRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (worksheetShareRef.current && !worksheetShareRef.current.contains(event.target as Node)) {
        setIsWorksheetShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleReview = async (student: Student) => {
    setSelectedStudent(student);
    setFeedback('');
    setIsLoading(true);
    const result = await generateStudentFeedback(student.name, student.topic);
    setFeedback(result);
    setIsLoading(false);
  };

  const handleGenerateClassFeedback = async () => {
    setIsLoading(true);
    setClassFeedback('');
    const result = await generateClassFeedback(
      classData.grade,
      classData.subject,
      classData.topic,
      classData.notes
    );
    setClassFeedback(result);
    setIsLoading(false);
  };

  const handleGenerateWorksheet = async () => {
    if (!worksheetData.studentName || !worksheetData.topic || !worksheetData.errorType) return;
    setIsLoading(true);
    setGeneratedWorksheet('');
    setWorksheetView('questions');
    const result = await generateAdaptiveWorksheet(
      worksheetData.studentName,
      worksheetData.topic,
      worksheetData.errorType,
      worksheetData.errorDetails
    );
    setGeneratedWorksheet(result);
    setIsLoading(false);
  };

  // Helper to format text for print window (converting markdown to HTML)
  const formatForPrint = (text: string) => {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Math (Simulate with italic serif)
    formatted = formatted.replace(/\$(.*?)\$/g, '<i style="font-family: \'Times New Roman\', serif; font-size: 1.1em; padding: 0 4px;">$1</i>');

    // Lists
    formatted = formatted.replace(/^\d+\. (.*$)/gim, '<div style="display:flex; margin-bottom: 10px;"><span style="font-weight:bold; margin-right:10px;">•</span><span>$1</span></div>'); // Simplify lists for print to avoid complex nesting logic in regex
    formatted = formatted.replace(/^[-*] (.*$)/gim, '<li>$1</li>');

    // Newlines
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  };

  const handlePrint = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const formattedContent = formatForPrint(content);
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; }
              h1, h2, h3 { color: #000; font-family: 'Arial', sans-serif; margin-top: 20px; margin-bottom: 10px; }
              h1 { font-size: 24px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; }
              h2 { font-size: 20px; text-transform: uppercase; }
              h3 { font-size: 18px; font-style: italic; }
              .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
              .header-title { font-size: 24px; font-weight: bold; text-transform: uppercase; font-family: 'Arial', sans-serif; }
              .meta { font-size: 14px; font-family: 'Arial', sans-serif; }
              .content { font-size: 16px; }
              strong { font-family: 'Arial', sans-serif; }
            </style>
          </head>
          <body>
            <div class="header">
                <div>
                    <div class="header-title">${worksheetView === 'answers' ? 'Answer Key' : 'Adaptive Practice Sheet'}</div>
                    <div class="meta">Topic: ${worksheetData.topic}</div>
                </div>
                <div style="text-align: right;">
                    <div class="meta">Student: ${worksheetData.studentName}</div>
                    <div class="meta">Date: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>
            <div class="content">${formattedContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
          printWindow.print();
      }, 500);
    }
    setIsWorksheetShareOpen(false);
  };

  const handleEmailWorksheet = () => {
    const subject = encodeURIComponent(`Adaptive Worksheet: ${worksheetData.topic}`);
    // Email body just contains raw text for now
    const body = encodeURIComponent(generatedWorksheet);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsWorksheetShareOpen(false);
  };

  const getWorksheetParts = () => {
    if (!generatedWorksheet) return { questions: '', answers: '' };
    const parts = generatedWorksheet.split('---ANSWER KEY---');
    return {
      questions: parts[0] || '',
      answers: parts.length > 1 ? parts[1] : ''
    };
  };

  const { questions: questionsContent, answers: answersContent } = getWorksheetParts();
  const currentContent = worksheetView === 'questions' ? questionsContent : answersContent;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">PulseX: Feedback & Practice Center</h1>
        <p className="text-gray-500 mt-1">Generate personalized student feedback and create adaptive worksheets from one unified hub.</p>
      </header>

      {/* Main Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Feedback Center
          </button>
          <button 
            onClick={() => setActiveTab('worksheets')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'worksheets' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Adaptive Worksheets
          </button>
        </div>
      </div>

      {activeTab === 'feedback' ? (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Performance Feedback</h2>
                    <p className="text-sm text-gray-500">Provide feedback to individual students or the entire class.</p>
                </div>
                {/* Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                    <button 
                        onClick={() => setFeedbackMode('individual')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${feedbackMode === 'individual' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        <User size={14} /> Individual
                    </button>
                    <button 
                        onClick={() => setFeedbackMode('class')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${feedbackMode === 'class' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        <Users size={14} /> Class Level (CLs)
                    </button>
                </div>
            </div>

            {feedbackMode === 'individual' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title={`Pending Reviews (${MOCK_STUDENTS.length})`} className="h-[600px] flex flex-col">
                        <div className="flex-1 overflow-auto pr-2">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100 sticky top-0 bg-white z-10">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Student</th>
                                        <th className="px-4 py-3 font-medium">Topic</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {MOCK_STUDENTS.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-500">{student.topic}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button 
                                                    onClick={() => handleReview(student)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 rounded-lg transition-all"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="h-[600px] flex flex-col justify-center items-center text-center p-0 bg-gray-50/50 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4 p-8">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-gray-600 font-medium">Generating feedback...</p>
                            </div>
                        ) : selectedStudent && feedback ? (
                            <div className="w-full h-full flex flex-col text-left">
                                <div className="border-b border-gray-200 p-4 bg-white shadow-sm shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                                            <p className="text-sm text-gray-500">Topic: {selectedStudent.topic}</p>
                                        </div>
                                        <Button variant="ghost" onClick={() => handleReview(selectedStudent)} className="!p-2 text-gray-400 hover:text-indigo-600"><RefreshCw size={18} /></Button>
                                    </div>
                                </div>
                                {/* Scrollable content area with preserved scale */}
                                <div className="flex-1 overflow-y-auto p-6 bg-white">
                                    <div className="prose prose-sm max-w-none text-gray-800">
                                        <FormattedContent content={feedback} mode="feedback" />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                                    <Button variant="secondary" onClick={() => handlePrint(feedback, `Feedback for ${selectedStudent.name}`)}>
                                        <Printer size={16} /> Print
                                    </Button>
                                    <Button>Approve & Send <ChevronRight size={16} /></Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center p-8">
                               <FileText size={48} className="mb-4 opacity-20" />
                               <p>Select a student from the list to generate AI-powered feedback.</p>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                // Class Feedback View
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1" title="Class Report Settings">
                       <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                            <input type="text" value={classData.grade} onChange={e => setClassData({...classData, grade: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input type="text" value={classData.subject} onChange={e => setClassData({...classData, subject: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <input type="text" value={classData.topic} onChange={e => setClassData({...classData, topic: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Observations / Notes</label>
                            <textarea value={classData.notes} onChange={e => setClassData({...classData, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" placeholder="E.g. Students struggled with..." />
                          </div>
                          <Button onClick={handleGenerateClassFeedback} disabled={isLoading} className="w-full">
                            <Sparkles size={16} /> Generate Class Report
                          </Button>
                       </div>
                    </Card>

                    <Card className="lg:col-span-2 min-h-[500px] bg-gray-50 flex flex-col p-0 overflow-hidden">
                        {classFeedback ? (
                            <div className="flex flex-col h-full">
                               <div className="flex-1 bg-white p-8 overflow-y-auto">
                                   <div className="prose prose-sm max-w-none text-gray-800">
                                       <FormattedContent content={classFeedback} mode="feedback" />
                                   </div>
                               </div>
                               <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                                   <Button variant="secondary" onClick={() => handlePrint(classFeedback, `Class Report - ${classData.grade} ${classData.subject}`)}>
                                       <Printer size={18} /> Print Report
                                   </Button>
                               </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-lg m-8">
                                <Users size={48} className="mb-4 opacity-20" />
                                <p>Generated class feedback report will appear here.</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
      ) : (
        // Worksheet View
        <div className="space-y-6 animate-fade-in">
             <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Adaptive Practice Engine</h2>
                <p className="text-sm text-gray-500">Generate highly targeted worksheets based on diagnosed student errors.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <Card className="lg:col-span-1">
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                        <input 
                           type="text" 
                           value={worksheetData.studentName}
                           onChange={(e) => setWorksheetData({...worksheetData, studentName: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           placeholder="e.g. Rohan Mehta"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                        <input 
                           type="text" 
                           value={worksheetData.topic}
                           onChange={(e) => setWorksheetData({...worksheetData, topic: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           placeholder="e.g. Fractions"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Error Type</label>
                        <select 
                           value={worksheetData.errorType}
                           onChange={(e) => setWorksheetData({...worksheetData, errorType: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                           <option value="">Select an error type</option>
                           {ERROR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Error Details</label>
                        <textarea 
                           value={worksheetData.errorDetails}
                           onChange={(e) => setWorksheetData({...worksheetData, errorDetails: e.target.value})}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
                           placeholder="Describe the specific struggle..."
                        />
                      </div>

                      <Button 
                        onClick={handleGenerateWorksheet} 
                        disabled={!worksheetData.errorType || isLoading}
                        className="w-full"
                      >
                         <Sparkles size={18} /> Generate Worksheet
                      </Button>
                   </div>
                </Card>

                {/* Preview Section - Updated UI */}
                <div className="lg:col-span-2 min-h-[700px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white z-20 relative">
                        <div className="flex items-center gap-4">
                           <h3 className="font-semibold text-gray-900">Worksheet Preview</h3>
                           
                           {/* View Toggle */}
                           {generatedWorksheet && answersContent && (
                             <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                  onClick={() => setWorksheetView('questions')}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${worksheetView === 'questions' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                                >
                                  Question Paper
                                </button>
                                <button
                                  onClick={() => setWorksheetView('answers')}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${worksheetView === 'answers' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                                >
                                  Answer Key
                                </button>
                             </div>
                           )}
                        </div>

                        <div className="flex gap-2 relative" ref={worksheetShareRef}>
                             <button 
                               onClick={() => setIsWorksheetShareOpen(!isWorksheetShareOpen)}
                               className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                               title="Share"
                             >
                                <Share2 size={20} />
                             </button>
                             {isWorksheetShareOpen && (
                               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-30 overflow-hidden animate-fade-in">
                                  <button 
                                    onClick={handleEmailWorksheet}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Mail size={16} /> Email
                                  </button>
                                  <button 
                                    onClick={() => handlePrint(currentContent, `Worksheet - ${worksheetData.studentName}`)}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <FileDown size={16} /> Save as PDF
                                  </button>
                               </div>
                             )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-100 flex justify-center">
                        {generatedWorksheet ? (
                            <div className="bg-white shadow-lg w-full max-w-[21cm] min-h-[29.7cm] p-12 text-black font-serif relative transition-all duration-300 transform scale-100 origin-top"> 
                                {/* Question Paper Header Simulation */}
                                <div className="border-b-2 border-black mb-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold uppercase tracking-wide font-sans">{worksheetView === 'questions' ? 'Practice Sheet' : 'Answer Key'}</h1>
                                            <p className="text-sm mt-1 font-sans text-gray-600">Adaptive Learning Module</p>
                                        </div>
                                        <div className="text-right font-sans">
                                            <div className="text-2xl font-bold">Marks: 20</div>
                                            <div className="text-sm text-gray-600">Time: 30 Mins</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm font-sans pt-2 border-t border-gray-300">
                                        <span className="font-semibold">Student: <span className="font-normal border-b border-dotted border-gray-400 px-2">{worksheetData.studentName}</span></span>
                                        <span className="font-semibold">Date: <span className="font-normal border-b border-dotted border-gray-400 px-2">{new Date().toLocaleDateString()}</span></span>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <FormattedContent content={currentContent} mode="worksheet" />

                                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 font-sans">
                                    Generated by Acadex AI • Personalized Learning Engine
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full">
                                <FileText size={64} className="mb-4 opacity-20" />
                                <p className="text-lg">Generated worksheet will appear here...</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};