
import React, { useState, useEffect, useMemo } from 'react';
import { User, View, Post, Comment } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import PostCard from './components/PostCard';
import { Plus, Send, X, AlertCircle, Edit3, Save, Book, Info, Moon, Sun, ChevronRight, Hash, ShieldCheck } from 'lucide-react';
import { CHANNELS } from './constants';
import { getStoredPosts, savePost, updatePostKarma, getStoredComments, saveComment, updateUser } from './services/mockBackend';
import { moderateContent } from './services/geminiService';
import { db, auth } from './services/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { createPost, getLivePosts } from './services/postService';

import Admin from './components/Admin';
import Feed from './components/Feed';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  const [view, setView] = useState<View>('home');


  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newChannel, setNewChannel] = useState('cse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    // Local storage user (Student Identity)
    const saved = localStorage.getItem('cw_user');
    if (saved) setUser(JSON.parse(saved));

    // Firebase Auth (Anonymous Session)
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setFirebaseUid(u.uid);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });

    // Theme
    const savedTheme = localStorage.getItem('cw_theme');
    const root = document.documentElement;
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      root.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      root.classList.add('dark');
    }

    return () => unsubscribeAuth();
  }, []);



  const handleNavigate = (v: View) => {
    setView(v);
    setSelectedPostId(null);
  };



  const handleCreatePost = async () => {
    if (!user || !newContent.trim()) return;

    // Ensure Firebase Auth is ready
    if (!auth.currentUser) {
      // Try one last time or wait
      try {
        await signInAnonymously(auth);
      } catch (e) {
        alert("Authentication failed. Please check your connection.");
        return;
      }
    }

    setIsSubmitting(true);
    setModerationError(null);

    try {
      // API call now handles moderation
      await createPost(newContent, newChannel);

      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
    } catch (e: any) {
      if (e.message.includes("Community Guidelines")) {
        setModerationError(e.message);
      } else {
        alert("Failed to post: " + (e.message || "Unknown error"));
      }
    }
    setIsSubmitting(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  const selectedPost = posts.find(p => p.id === selectedPostId);
  const isProfileView = view === 'profile';
  const isAdminView = view === 'admin';

  return (
    <Layout currentView={view} onNavigate={handleNavigate} onSearch={setSearchQuery}>

      <div className="flex flex-col py-2 transition-colors duration-300">
        {selectedPostId && selectedPost ? (
          <PostDetailPage
            post={selectedPost}
            onBack={() => setSelectedPostId(null)}
            user={user}
            onVote={(id, v) => console.log('Vote:', id, v)}
          />
        ) : isAdminView ? (
          <Admin userEmail={auth.currentUser?.email || null} />
        ) : view === 'channels' ? (
          <ChannelsPage
            onSelectChannel={(id) => {
              setNewChannel(id);
              setView('home');
            }}
          />
        ) : view === 'profile' ? (
          <ProfilePage
            user={user}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onUpdateUser={handleUpdateUser}
            onLogout={() => { localStorage.clear(); setUser(null); }}
          />
        ) : (
          <Feed
            view={view}
            user={user}
            searchQuery={searchQuery}
            channelId={newChannel}
            setChannelId={setNewChannel}
            onPostClick={(id) => setSelectedPostId(id)}
            firebaseUid={firebaseUid}
          />
        )}
      </div>

      {!isProfileView && !selectedPostId && (
        <button
          onClick={() => setIsCreating(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 z-50 transition-all active:scale-90 animate-in fade-in zoom-in duration-300"
        >
          <Plus size={32} />
        </button>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col max-w-lg mx-auto border-x border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
            <button onClick={() => setIsCreating(false)} className="text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors">
              <X size={24} />
            </button>
            <h2 className="font-extrabold text-slate-900 dark:text-white">New Whisper</h2>
            <button
              disabled={!newContent.trim() || isSubmitting}
              onClick={handleCreatePost}
              className="bg-indigo-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? 'Checking...' : <><Send size={16} /> Post</>}
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
            {moderationError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-red-600 dark:text-red-500">Submission Blocked</p>
                  <p className="text-xs text-red-500/80 font-medium">{moderationError}</p>
                </div>
              </div>
            )}

            <div className="mb-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase block mb-3 tracking-widest">Post to Department:</span>
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {CHANNELS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setNewChannel(c.id)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${newChannel === c.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}
                  >
                    #{c.name}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Give it a title..."
              className="bg-transparent text-xl font-extrabold placeholder:text-slate-200 dark:placeholder:text-slate-800 focus:outline-none text-slate-900 dark:text-white"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <textarea
              placeholder="What's the whisper?"
              className="bg-transparent min-h-[300px] resize-none placeholder:text-slate-200 dark:placeholder:text-slate-800 focus:outline-none leading-relaxed text-slate-800 dark:text-slate-200 text-base"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

// Pages as Helper Components

const PostDetailPage: React.FC<{ post: Post; onBack: () => void; onVote: (id: string, v: 'up' | 'down') => void; user: User }> = ({
  post, onBack, onVote, user
}) => {
  const [comments, setComments] = useState(getStoredComments(post.id));
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    const mod = await moderateContent(newComment);
    if (!mod.isSafe) {
      alert(mod.reason);
      setIsSubmitting(false);
      return;
    }

    const c: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId: post.id,
      authorId: user.id,
      authorName: user.username,
      content: newComment,
      karma: 1,
      timestamp: Date.now(),
      userVote: 'up'
    };

    saveComment(c);
    setComments(getStoredComments(post.id));
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 border-b border-slate-50 dark:border-slate-900 flex items-center">
        <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 text-xs font-black px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center gap-1 active:scale-95 transition-all">
          <ChevronRight className="rotate-180" size={14} /> Back
        </button>
      </div>
      <PostCard post={post} onVote={onVote} onClick={() => { }} />

      <div className="p-4 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6 px-4">Thread Comments</h4>
        <div className="space-y-6">
          {comments.map(c => (
            <div key={c.id} className="mx-4 pl-4 border-l-2 border-indigo-500/20 dark:border-slate-800 animate-in slide-in-from-left duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{c.authorName}</span>
                <span className="text-[10px] font-medium text-slate-300 dark:text-slate-700">Just now</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">{c.content}</p>
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                <button className="hover:text-indigo-500 transition-colors">Upvote</button>
                <button className="hover:text-indigo-500 transition-colors">Reply</button>
                <span className="ml-auto bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{c.karma} karma</span>
              </div>
            </div>
          ))}
        </div>
        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-300 dark:text-slate-700 text-sm italic font-medium">Be the first to whisper a response.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-20 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-50 dark:border-slate-900 flex gap-3 items-end">
        <textarea
          placeholder="Add a comment..."
          className="flex-grow bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none max-h-32 text-slate-800 dark:text-slate-200 transition-all"
          rows={1}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const ChannelsPage: React.FC<{ onSelectChannel: (id: string) => void }> = ({ onSelectChannel }) => (
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

const ProfilePage: React.FC<{
  user: User;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUpdateUser: (u: User) => void;
  onLogout: () => void
}> = ({ user, isDarkMode, onToggleTheme, onUpdateUser, onLogout }) => {
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



export default App;
