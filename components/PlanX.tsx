import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { generateLessonPlan } from '../services/geminiService';
import { Sparkles, Copy, Share2, Check, Mail, FileDown } from 'lucide-react';

export const PlanX: React.FC = () => {
  const [formData, setFormData] = useState({
    topic: '',
    grade: '5th Grade',
    language: 'Hindi',
    context: 'Rural Village'
  });
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!formData.topic) return;
    setIsLoading(true);
    const result = await generateLessonPlan(formData.topic, formData.grade, formData.language, formData.context);
    setPlan(result);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lesson Plan - ${formData.topic}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #1f2937; }
              h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>Lesson Plan: ${formData.topic}</h1>
            <div class="content">${plan.replace(/\n/g, '<br/>')}</div>
            <script>
              window.onload = () => { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsShareOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Lesson Plan: ${formData.topic}`);
    const body = encodeURIComponent(plan);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">PlanX: Dynamic Lesson Planner</h1>
        <p className="text-gray-500 mt-1">Generate comprehensive, culturally-relevant lesson plans in multiple Indian languages.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Create a Lesson Plan">
          <div className="space-y-6">
             <p className="text-sm text-gray-500">Fill in the details to generate a culturally-relevant lesson plan.</p>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 placeholder="e.g., The Indian Rebellion of 1857"
                 value={formData.topic}
                 onChange={(e) => setFormData({...formData, topic: e.target.value})}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
               <select 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 value={formData.grade}
                 onChange={(e) => setFormData({...formData, grade: e.target.value})}
               >
                 {['Kindergarten', '1st Grade', '3rd Grade', '5th Grade', '8th Grade', '10th Grade', '12th Grade'].map(g => (
                   <option key={g} value={g}>{g}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
               <select 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 value={formData.language}
                 onChange={(e) => setFormData({...formData, language: e.target.value})}
               >
                 {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'].map(l => (
                   <option key={l} value={l}>{l}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Cultural Context</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 placeholder="e.g. Rural Village, Urban City"
                 value={formData.context}
                 onChange={(e) => setFormData({...formData, context: e.target.value})}
               />
             </div>

             <Button 
               onClick={handleGenerate} 
               disabled={!formData.topic} 
               isLoading={isLoading}
               className="w-auto bg-indigo-600 text-white hover:bg-indigo-700"
             >
               <Sparkles size={18} /> Generate Plan
             </Button>
          </div>
        </Card>

        <Card title="Generated Plan" className="min-h-[600px] flex flex-col">
           {plan ? (
             <div className="flex flex-col h-full">
               <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Your AI-generated lesson plan.</p>
                  <div className="flex gap-2 relative" ref={shareRef}>
                     <button 
                       onClick={handleCopy}
                       className={`p-2 rounded-lg transition-all ${copied ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`}
                       title="Copy to clipboard"
                     >
                       {copied ? <Check size={18} /> : <Copy size={18} />}
                     </button>
                     
                     <button 
                       onClick={() => setIsShareOpen(!isShareOpen)}
                       className={`p-2 rounded-lg transition-all ${isShareOpen ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`}
                       title="Share"
                     >
                       <Share2 size={18} />
                     </button>

                     {isShareOpen && (
                       <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-fade-in">
                          <button 
                            onClick={handleEmail}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Mail size={16} /> Email
                          </button>
                          <button 
                            onClick={handlePrint}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FileDown size={16} /> Save as PDF
                          </button>
                       </div>
                     )}
                  </div>
               </div>
               <div className="prose prose-sm max-w-none overflow-y-auto flex-1 pr-2 text-gray-800">
                 {plan.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                 ))}
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <p>Generated plan will appear here.</p>
             </div>
           )}
        </Card>
      </div>
    </div>
  );
};