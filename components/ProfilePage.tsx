import React, { useState } from 'react';
import { User } from '../types';
import { Edit3, X, Book, Info, Save, Moon, Sun, ChevronRight, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
    user: User;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onUpdateUser: (u: User) => void;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, isDarkMode, onToggleTheme, onUpdateUser, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editGender, setEditGender] = useState(user.gender || '');
    const [editMajor, setEditMajor] = useState(user.major || '');
    const [editBio, setEditBio] = useState(user.bio || '');

    const handleSave = () => {
        onUpdateUser({
            ...user,
            gender: editGender,
            major: editMajor,
            bio: editBio
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-6 space-y-6 bg-white dark:bg-slate-950 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Identity Settings</h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-300 hover:text-slate-600 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 block tracking-[0.2em]">Gender Preference</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Male', 'Female', 'Non-binary', 'Other'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setEditGender(g)}
                                    className={`py-4 rounded-2xl text-xs font-black border transition-all ${editGender === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 block tracking-[0.2em]">Primary Major</label>
                        <div className="relative group">
                            <Book className="absolute left-4 top-4 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="e.g. Physics"
                                value={editMajor}
                                onChange={(e) => setEditMajor(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 block tracking-[0.2em]">Secret Bio</label>
                        <div className="relative group">
                            <Info className="absolute left-4 top-4 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <textarea
                                placeholder="Share something about yourself anonymously..."
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-slate-900 dark:text-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <Save size={20} />
                    Save Identity
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-slate-950 min-h-screen transition-colors duration-500 animate-in fade-in duration-500">
            <div className="flex flex-col items-center text-center mb-10 mt-4 animate-in zoom-in duration-700">
                <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-4xl font-black mb-6 shadow-2xl shadow-indigo-500/30 text-white transform hover:rotate-6 transition-transform">
                    {user.username.substring(0, 2).toUpperCase()}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{user.username}</h2>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {user.gender && <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-500/20">{user.gender}</span>}
                    {user.major && <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-500/20">{user.major}</span>}
                </div>
                {user.bio && <p className="text-slate-500 dark:text-slate-400 text-sm mt-6 italic max-w-xs leading-relaxed font-medium px-4 opacity-80">"{user.bio}"</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-center shadow-sm">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{user.karma}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Total Karma</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-center shadow-sm">
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">Top 5%</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Global Rank</div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toggle - Fixed UI transition between Day (White) and Night (Navy/Slate) */}
                <button
                    onClick={onToggleTheme}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-left font-black text-sm transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm transition-colors">
                            {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-orange-500" />}
                        </div>
                        <span>{isDarkMode ? 'Night Mode' : 'Day Mode'}</span>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1.5 transition-colors duration-500 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0 shadow-md'}`} />
                    </div>
                </button>

                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-left font-black text-sm transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <Edit3 size={18} className="text-indigo-600" />
                        </div>
                        <span>Identity Details</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="w-full bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-left font-black text-sm transition-all flex items-center gap-4 text-slate-700 dark:text-slate-300 active:scale-[0.99]">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <ShieldCheck className="text-emerald-500" size={18} />
                    </div>
                    Guidelines & Privacy
                </button>

                <button
                    onClick={onLogout}
                    className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 p-5 rounded-3xl text-left font-black text-sm text-red-600 dark:text-red-500 transition-all flex items-center gap-4 active:scale-[0.99]"
                >
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-red-500/10 flex items-center justify-center shadow-sm">
                        <X size={18} />
                    </div>
                    Discard Current Identity
                </button>
            </div>

            <div className="mt-16 text-center">
                <p className="text-[10px] text-slate-300 dark:text-slate-700 uppercase font-black tracking-[0.4em]">Campus Whisper v1.2.0</p>
                <p className="text-[8px] text-slate-200 dark:text-slate-800 font-bold mt-2 uppercase">Verified University Node</p>
            </div>
        </div>
    );
};

export default ProfilePage;
