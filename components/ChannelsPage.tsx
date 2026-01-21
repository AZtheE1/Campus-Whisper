import React from 'react';
import { Hash } from 'lucide-react';
import { CHANNELS } from '../constants';

interface ChannelsPageProps {
    onSelectChannel: (id: string) => void;
}

const ChannelsPage: React.FC<ChannelsPageProps> = ({ onSelectChannel }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">University Hub</h2>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-[0.1em]">{CHANNELS.length} Active Depts</span>
        </div>
        <div className="grid gap-4">
            {CHANNELS.map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group active:scale-[0.99]">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                <Hash size={16} className="text-indigo-500 group-hover:text-white" />
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.name}</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-tight">{c.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1 italic leading-relaxed font-medium">"{c.description}"</p>
                    </div>
                    <button
                        onClick={() => onSelectChannel(c.id)}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 px-5 py-2.5 rounded-xl text-xs font-black transition-all text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                        View Feed
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export default ChannelsPage;
