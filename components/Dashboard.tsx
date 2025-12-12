import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { FileText, ClipboardCheck, MessageSquare, CheckCircle, Calendar, ChevronDown, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Chapter 1', studentScore: 82, classAvg: 75 },
  { name: 'Chapter 2', studentScore: 68, classAvg: 72 },
  { name: 'Chapter 3', studentScore: 90, classAvg: 80 },
  { name: 'Term 1', studentScore: 85, classAvg: 78 },
];

// Mock Data for Social Science Table - Sorted Alphabetically
const socialScienceMarks = [
  { name: 'Aarav Sharma', ch1: 42, ch2: 45 },
  { name: 'Aditi Rao', ch1: 38, ch2: 41 },
  { name: 'Ananya Gupta', ch1: 48, ch2: 49 },
  { name: 'Dev Reddy', ch1: 35, ch2: 38 },
  { name: 'Ishaan Kumar', ch1: 40, ch2: 36 },
  { name: 'Kabir Das', ch1: 45, ch2: 47 },
  { name: 'Mira Nair', ch1: 39, ch2: 42 },
  { name: 'Priya Patel', ch1: 44, ch2: 46 },
  { name: 'Rohan Mehta', ch1: 41, ch2: 43 },
  { name: 'Sana Khan', ch1: 47, ch2: 48 },
  { name: 'Vikram Singh', ch1: 32, ch2: 35 },
].sort((a, b) => a.name.localeCompare(b.name));

const StatCard = ({ title, value, sub, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <Icon className="text-gray-400" size={20} />
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateOptions = ['Today', 'Last 7 Days', 'This Month', 'Last Month', 'This Year'];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSubtext = () => {
    switch(dateRange) {
      case 'Today': return 'today';
      case 'Last 7 Days': return 'this week';
      case 'This Month': return 'this month';
      case 'Last Month': return 'last month';
      case 'This Year': return 'this year';
      default: return 'this month';
    }
  };

  const periodText = getSubtext();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Teacher!</h1>
            <p className="text-gray-500 mt-1">Here's your co-pilot's summary for {periodText}.</p>
        </div>
        
        {/* Custom Date Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors w-40 justify-between"
           >
             <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
               <Calendar size={16} className="text-gray-500" />
               <span className="truncate">{dateRange}</span>
             </div>
             <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
           </button>
           
           {isDropdownOpen && (
             <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
               {dateOptions.map((option) => (
                 <button
                   key={option}
                   onClick={() => { setDateRange(option); setIsDropdownOpen(false); }}
                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${dateRange === option ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                 >
                   {option}
                 </button>
               ))}
             </div>
           )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tests Conducted" value="15" sub={`+2 ${periodText}`} icon={ClipboardCheck} />
        <StatCard title="Uploaded Answer Scripts" value="352" sub={`+60 ${periodText}`} icon={FileText} />
        <StatCard title="Graded Answer Scripts" value="231" sub={`+32 ${periodText}`} icon={CheckCircle} />
        <StatCard title="Feedbacks Given" value="184" sub={`+25 ${periodText}`} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <Card title="Student Performance Overview" className="h-[450px]">
           <div className="h-full w-full pb-10 pt-4">
              <p className="text-sm text-gray-500 mb-4 px-4">Performance comparison: Student vs. Class Average.</p>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} barGap={8} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10}>
                    <Label value="Assessment Timeline" offset={-10} position="insideBottom" fill="#9ca3af" fontSize={12} />
                  </XAxis>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 100]}>
                     <Label value="Score (100 marks maximum)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#9ca3af" fontSize={12} />
                  </YAxis>
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="studentScore" fill="#3758f9" radius={[4, 4, 0, 0]} barSize={20} name="Student Score" />
                  <Bar dataKey="classAvg" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Class Average Score" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* GradX Overview List */}
        <Card title="GradX Overview" className="h-[450px] overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
             <p className="text-sm text-gray-500">Review and approve recently graded assignments.</p>
          </div>
          <div className="overflow-auto flex-1">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Grade</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Aarav Sharma', subject: 'Science', grade: '85/100', status: 'Accepted' },
                    { name: 'Priya Patel', subject: 'History', grade: '78/100', status: 'Pending' },
                    { name: 'Rohan Mehta', subject: 'Math', grade: '92/100', status: 'Modified' },
                    { name: 'Ananya Gupta', subject: 'English', grade: '88/100', status: 'Accepted' },
                    { name: 'Vikram Singh', subject: 'Physics', grade: '65/100', status: 'Pending' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 text-gray-500">{row.subject}</td>
                      <td className="px-6 py-4 text-gray-900">{row.grade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-1 border border-gray-200 rounded-lg hover:border-indigo-200 transition-all">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>
      </div>

      {/* New Section: Subject Performance Table */}
      <Card title="Subject: Social Science" className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Chapter 1 <span className="text-gray-400 font-normal">(50 Marks)</span></th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Chapter 2 <span className="text-gray-400 font-normal">(50 Marks)</span></th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Total %</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {socialScienceMarks.map((student, idx) => {
                const total = student.ch1 + student.ch2;
                const percentage = Math.round(total); // Since max is 100 (50+50)
                const isImproved = student.ch2 > student.ch1;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600 font-mono bg-gray-50/50">{student.ch1}</td>
                    <td className="px-6 py-4 text-center text-gray-600 font-mono bg-gray-50/50">{student.ch2}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                        percentage >= 90 ? 'bg-green-100 text-green-700' :
                        percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-medium">
                        {isImproved ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <TrendingUp size={14} /> +{(student.ch2 - student.ch1)}
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <TrendingUp size={14} className="rotate-180" /> {(student.ch2 - student.ch1)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};