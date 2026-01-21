import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser, registerUser, ALLOWED_DOMAIN } from '../services/authService';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const userCred = await loginUser(email, password);
        // Profile fetching is handled in App.tsx via onAuthStateChanged
        // But we can just wait; App.tsx's listener will trigger and update the state.
      } else {
        await registerUser(email, password, username);
        // Registration success logic handled by listener or implicit login
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all";

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Campus Whisper</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Anonymous. Verified. Secure.</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-2 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800 flex relative">
          <div
            className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-indigo-50 dark:bg-slate-800 rounded-2xl transition-all duration-300 ease-in-out ${mode === 'register' ? 'translate-x-[100%] translate-x-4' : 'translate-x-0'}`}
            style={{ left: mode === 'register' ? '4px' : '4px', width: 'calc(50% - 8px)' }}
          />
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold relative z-10 rounded-2xl transition-colors ${mode === 'login' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold relative z-10 rounded-2xl transition-colors ${mode === 'register' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-in shake duration-300">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative group animate-in slide-in-from-left duration-300">
              <UserIcon className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Choose a unique nickname"
                required
                minLength={3}
                className={inputClasses}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="email"
              placeholder={`your_id${ALLOWED_DOMAIN}`}
              required
              className={inputClasses}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              className={inputClasses}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'login' ? 'Enter Campus' : 'Create Identity'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8 font-medium">
          By entering, you agree to our <span className="underline decoration-indigo-500/30">Honor Code</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
