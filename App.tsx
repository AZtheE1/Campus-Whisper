import React, { useState, useEffect } from 'react';
import { User, View } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import { Plus, Send, X, AlertCircle } from 'lucide-react';
import { CHANNELS } from './constants';
import { db, auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { createPost } from './services/postService';
import { getUserProfile, updateUserProfile } from './services/authService';

// Import Pages
import Admin from './components/Admin';
import Feed from './components/Feed';
import ChannelsPage from './components/ChannelsPage';
import ProfilePage from './components/ProfilePage';
import PostDetailPage from './components/PostDetailPage';

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Navigation State
  const [view, setView] = useState<View>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState('cse');

  // Create Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newChannel, setNewChannel] = useState('cse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Auth & Init Effects ---
  useEffect(() => {
    // 1. Load Local Storage
    const savedUser = localStorage.getItem('cw_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // 2. Load Theme
    const savedTheme = localStorage.getItem('cw_theme');
    const root = document.documentElement;
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      root.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      root.classList.add('dark');
    }

    // 3. Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setFirebaseUid(u.uid);
        try {
          const profile = await getUserProfile(u.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('cw_user', JSON.stringify(profile));
          }
        } catch (err) {
          console.error("Profile sync failed", err);
        }
      } else {
        setFirebaseUid(null);
        setUser(null);
        localStorage.removeItem('cw_user');
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // --- Handlers ---

  const handleNavigate = (newView: View) => {
    setView(newView);
    setSelectedPostId(null);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('cw_theme', newMode ? 'dark' : 'light');
    const root = document.documentElement;
    if (newMode) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cw_user', JSON.stringify(updatedUser));
    if (firebaseUid) {
      await updateUserProfile(firebaseUid, updatedUser).catch(console.error);
    }
  };

  const handleCreatePost = async () => {
    if (!auth.currentUser) {
      alert("Please log in to post.");
      return;
    }
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    setModerationError(null);

    try {
      await createPost(newContent, newChannel);
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      // If we posted to a channel, maybe switch to it? 
      // For now, staying on current view.
    } catch (e: any) {
      if (e.message && e.message.includes("Community Guidelines")) {
        setModerationError(e.message);
      } else {
        alert("Error creating post: " + e.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

  if (!user && authInitialized) {
    return <Auth onAuthSuccess={setUser} />;
  }

  // Loading state (optional, but good for UX)
  if (!user && !authInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Loading Campus...</div>;
  }

  // --- View Switcher ---
  let content;

  if (selectedPostId) {
    content = (
      <PostDetailPage
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
        user={user!}
        firebaseUid={firebaseUid}
      />
    );
  } else if (view === 'admin') {
    content = <Admin userEmail={user?.email || null} />;
  } else if (view === 'channels') {
    content = (
      <ChannelsPage
        onSelectChannel={(id) => {
          setCurrentChannelId(id);
          handleNavigate('home');
        }}
      />
    );
  } else if (view === 'profile') {
    content = (
      <ProfilePage
        user={user!}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onUpdateUser={handleUpdateUser}
        onLogout={() => auth.signOut()}
      />
    );
  } else {
    // Default: Feed (Home or My Posts)
    content = (
      <Feed
        key={currentChannelId} // Force re-render on channel switch
        view={view}
        user={user!}
        searchQuery={''} // Search state can be lifted if needed
        channelId={currentChannelId}
        setChannelId={setCurrentChannelId}
        onPostClick={(id) => setSelectedPostId(id)}
        firebaseUid={firebaseUid}
      />
    );
  }

  return (
    <Layout currentView={view} onNavigate={handleNavigate} onSearch={(q) => console.log(q)}>
      {content}

      {/* Floating Action Button (Only show on Feed) */}
      {!selectedPostId && view !== 'profile' && view !== 'admin' && (
        <button
          onClick={() => setIsCreating(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 z-50 transition-all active:scale-90 animate-in fade-in zoom-in duration-300"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Create Post Modal */}
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

export default App;
