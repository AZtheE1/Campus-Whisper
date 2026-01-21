
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<'welcome' | 'email' | 'code' | 'username'>('welcome');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = () => {
    if (!email.endsWith('@student.bup.edu.bd')) {
      alert("This app is exclusive to BUP students.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      alert("Invalid code.");
      return;
    }
    setStep('username');
  };

  const handleComplete = () => {
    if (username.length < 3) return;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      karma: 1,
      joinedAt: Date.now(),
    };
    localStorage.setItem('cw_user', JSON.stringify(newUser));
    onAuthSuccess(newUser);
  };

  const containerClasses = "flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300";
  const cardClasses = "flex flex-col min-h-screen p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300";
  const inputClasses = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white";

  if (step === 'welcome') {
    return (
      <div className={containerClasses}>
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
          <ShieldCheck size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Campus Whisper</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
          The anonymous heart of your university. <br />Verified, private, and student-only.
        </p>
        <button
          onClick={() => setStep('email')}
          className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className="mt-12 max-w-sm mx-auto w-full">
        {step === 'email' && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-2">What's your .edu email?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">We only use this to verify you're a student. It's never stored or linked to your identity.</p>
            <div className="relative mb-6 text-left">
              <Mail className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="email"
                placeholder="name@university.edu"
                className={inputClasses}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              disabled={isLoading}
              onClick={handleSendCode}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all"
            >
              {isLoading ? 'Sending Code...' : 'Verify Email'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Enter the 6-digit verification code we sent to {email}.</p>
            <div className="relative mb-6 text-left">
              <Lock className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className={`${inputClasses} text-center tracking-[1em] text-xl font-bold`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Confirm Code
            </button>
          </div>
        )}

        {step === 'username' && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-2">Pick an alias</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">This is your persistent anonymous identity. You can change it later.</p>
            <div className="relative mb-6 text-left">
              <UserIcon className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                placeholder="e.g. WhisperingOwl"
                className={inputClasses}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button
              disabled={username.length < 3}
              onClick={handleComplete}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Create Identity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
