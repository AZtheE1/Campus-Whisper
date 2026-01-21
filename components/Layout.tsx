
import React from 'react';
import { Home, Compass, User as UserIcon, MessageSquare, Search } from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, onSearch }) => {
  const isProfile = currentView === 'profile';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 max-w-lg mx-auto border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Campus Whisper</h1>
          {!isProfile && (
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Search size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>
        {!isProfile && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
            <input
              type="text"
              placeholder="Search posts or channels..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-lg bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between z-50 transition-colors duration-300">
        <NavButton 
          active={currentView === 'home'} 
          onClick={() => onNavigate('home')} 
          icon={<Home size={24} />} 
          label="Home" 
        />
        <NavButton 
          active={currentView === 'channels'} 
          onClick={() => onNavigate('channels')} 
          icon={<Compass size={24} />} 
          label="Channels" 
        />
        <NavButton 
          active={currentView === 'my-posts'} 
          onClick={() => onNavigate('my-posts')} 
          icon={<MessageSquare size={24} />} 
          label="Posts" 
        />
        <NavButton 
          active={currentView === 'profile'} 
          onClick={() => onNavigate('profile')} 
          icon={<UserIcon size={24} />} 
          label="Profile" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ 
  active, onClick, icon, label 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    {icon}
    <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
  </button>
);

export default Layout;
