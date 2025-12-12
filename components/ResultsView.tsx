import React from 'react';
import { GradingResult } from '../types';
import { Card } from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ResultsViewProps {
  result: GradingResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const percentage = Math.round((result.totalScore / result.maxTotalScore) * 100);
  
  // Color code the score
  const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
  const progressColor = percentage >= 80 ? 'bg-green-600' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600';

  const chartData = result.breakdown.map(item => ({
    name: `Q${item.questionId}`,
    score: item.score,
    max: item.maxScore,
    percentage: (item.score / item.maxScore) * 100
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-l-4 border-l-indigo-500">
          <div className="flex flex-col h-full justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.studentName}</h2>
            <p className="text-gray-600">{result.summaryFeedback}</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Score</span>
          <div className={`text-5xl font-extrabold my-2 ${scoreColor}`}>
            {result.totalScore} <span className="text-2xl text-gray-400">/ {result.maxTotalScore}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${percentage}%` }}></div>
          </div>
          <span className="mt-2 text-sm font-semibold text-gray-600">{percentage}% Accuracy</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown List */}
        <Card title="Question Breakdown" className="h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {result.breakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                      {item.questionId}
                    </span>
                    <span className="font-medium text-gray-900">Question {item.questionId}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.score === item.maxScore ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {item.score} / {item.maxScore} pts
                  </span>
                </div>
                <p className="text-gray-600 text-sm pl-10">{item.feedback}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Visualization */}
        <Card title="Performance Analytics" className="h-[500px]">
          <div className="h-full w-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name">
                  <Label value="Question Number" offset={0} position="insideBottom" dy={10} fill="#6b7280" fontSize={12} />
                </XAxis>
                <YAxis>
                  <Label value="Points Scored" angle={-90} position="insideLeft" fill="#6b7280" fontSize={12} style={{ textAnchor: 'middle' }} />
                </YAxis>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#4ade80' : entry.percentage >= 50 ? '#facc15' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400"></div> Strong</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Average</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400"></div> Needs Focus</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};