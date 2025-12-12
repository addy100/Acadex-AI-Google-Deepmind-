import React, { useState } from 'react';
import { ViewMode } from './types';
import { GradingAssistant } from './components/GradingAssistant'; // Maps to GradX
import { TeachingAssistant } from './components/TeachingAssistant'; // Maps to ChatX
import { Dashboard } from './components/Dashboard';
import { PlanX } from './components/PlanX';
import { PulseX } from './components/PulseX';
import { GraduationCap, BookOpen, LayoutDashboard, Menu, MessageSquare, PenTool, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => { setView(mode); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
        view === mode 
          ? 'bg-indigo-50 text-indigo-600 font-semibold' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} strokeWidth={view === mode ? 2.5 : 2} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col py-6">
          <div className="flex items-center gap-2 mb-10 px-6">
            <div className="text-indigo-600">
               <Layers size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Acadex AI</h1>
          </div>

          <nav className="flex-1 px-4">
            <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <div className="my-4 border-t border-gray-100"></div>
            <NavItem mode={ViewMode.PLANX} icon={BookOpen} label="PlanX" />
            <NavItem mode={ViewMode.GRADX} icon={GraduationCap} label="GradX" />
            <NavItem mode={ViewMode.CHATX} icon={MessageSquare} label="ChatX" />
            <NavItem mode={ViewMode.PULSEX} icon={PenTool} label="PulseX" />
          </nav>

          <div className="px-6 mt-auto">
             <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">T</div>
                <div className="overflow-hidden">
                   <p className="text-sm font-semibold text-gray-900 truncate">Teacher</p>
                   <p className="text-xs text-gray-500 truncate">teacher@school.edu</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-600" />
            <span className="font-bold text-gray-900">Acadex AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 relative scroll-smooth">
           <div className="max-w-7xl mx-auto h-full flex flex-col">
             {view === ViewMode.DASHBOARD && <Dashboard />}
             {view === ViewMode.PLANX && <PlanX />}
             {view === ViewMode.GRADX && <GradingAssistant />}
             {view === ViewMode.CHATX && <TeachingAssistant />}
             {view === ViewMode.PULSEX && <PulseX />}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;