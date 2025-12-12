import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendTeachingAssistantMessage } from '../services/geminiService';
import { Button } from './Button';
import { Card } from './Card';
import { Send, Bot, User, Search, Sparkles, MessageSquare, Plus, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export const TeachingAssistant: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a default session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      date: new Date().toLocaleDateString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !currentSessionId) return;

    const userMsg: ChatMessage = { role: 'user', text, timestamp: new Date() };
    
    // Update state immediately
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        // Update title if it's the first message
        const title = s.messages.length === 0 ? (text.length > 25 ? text.substring(0, 25) + '...' : text) : s.title;
        return { ...s, title, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const { text: responseText, groundingChunks } = await sendTeachingAssistantMessage(messages, text);
      
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: responseText, 
        timestamp: new Date(),
        groundingChunks 
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, modelMsg] };
        }
        return s;
      }));

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "I encountered an error. Please try again.", timestamp: new Date() };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };

  const suggestions = [
    "Lesson plan for Photosynthesis",
    "Quiz on Indian History",
    "Explain Thermodynamics simply",
    "Classroom activity for 5th Grade",
  ];

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.24))] flex gap-6 animate-fade-in pb-2">
      
      {/* Sidebar - Chat History */}
      <div className="w-64 shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:flex">
         <div className="p-4 border-b border-gray-100">
            <Button onClick={createNewSession} className="w-full justify-center !bg-indigo-600 hover:!bg-indigo-700 !text-white !py-2.5">
               <Plus size={18} /> New Chat
            </Button>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">History</div>
            {sessions.map(session => (
               <button
                 key={session.id}
                 onClick={() => setCurrentSessionId(session.id)}
                 className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${
                    currentSessionId === session.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                 }`}
               >
                  <MessageSquare size={16} className="mt-0.5 shrink-0 opacity-70" />
                  <div className="overflow-hidden">
                     <p className="truncate">{session.title}</p>
                     <p className="text-[10px] opacity-60 mt-0.5">{session.date}</p>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-lg border-indigo-100 overflow-hidden relative" title="ChatX">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-indigo-400" />
              </div>
              <p className="text-lg font-medium">How can I help you today?</p>
            </div>
          ) : (
             <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'}`}>
                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>

                      <div className="flex flex-col gap-2 min-w-0">
                        <div
                          className={`p-4 rounded-2xl text-base leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {/* Grounding Sources (if any) */}
                        {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.groundingChunks.map((chunk, i) => chunk.web?.uri && (
                              <a 
                                key={i} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 flex items-center gap-1"
                              >
                                <Search size={10} /> {chunk.web.title || 'Source'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex w-full justify-start">
                     <div className="flex max-w-[80%] flex-row items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Bot size={20} />
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                          <span className="text-gray-500 text-sm">Thinking</span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                     </div>
                  </div>
                )}
             </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          {/* Suggestion Chips - Always visible above input */}
          <div className="flex justify-start gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
             {suggestions.map(s => (
               <button
                 key={s}
                 onClick={() => { setInput(s); handleSendMessage(s); }}
                 disabled={isLoading}
                 className="px-4 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 text-gray-600 text-sm rounded-full transition-all whitespace-nowrap flex items-center gap-2"
               >
                  <Sparkles size={14} className="text-indigo-500" /> {s}
               </button>
             ))}
           </div>

          <form onSubmit={handleSubmit} className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a 15-min activity for the water cycle..."
              className="flex-1 px-5 py-3 pr-12 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="absolute right-2 top-1.5 bottom-1.5 rounded-lg !px-3 shadow-none bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};