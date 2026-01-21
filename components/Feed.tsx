import React, { useState, useEffect, useMemo } from 'react';
import { Post, User, View } from '../types';
import { getLivePosts } from '../services/postService';
import PostCard from './PostCard';
import { Book } from 'lucide-react';
import { CHANNELS } from '../constants';

interface FeedProps {
    view: View;
    user: User | null; // For identifying "my posts"
    searchQuery: string;
    channelId: string;
    setChannelId: (id: string) => void;
    onPostClick: (id: string) => void;
    firebaseUid: string | null;
}

const Feed: React.FC<FeedProps> = ({
    view,
    user,
    searchQuery,
    channelId,
    setChannelId,
    onPostClick,
    firebaseUid
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Live subscription to Firestore
    useEffect(() => {
        setPosts([]); // Clear posts to show loading state
        setLoading(true);
        const unsubscribe = getLivePosts(channelId, (newPosts) => {
            setPosts(newPosts);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [channelId]);

    // Client-side filtering
    const filteredPosts = useMemo(() => {
        let list = posts;
        if (view === 'my-posts' && user) {
            list = list.filter(p => p.authorId === user.id);
        }
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.title.toLowerCase().includes(lowerQ) ||
                p.content.toLowerCase().includes(lowerQ)
            );
        }
        return list;
    }, [posts, view, user, searchQuery]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[50vh]">
            {/* Channel Filter Bar */}
            <div className="flex gap-2.5 overflow-x-auto pb-4 px-4 -mx-4 no-scrollbar mb-2 sticky top-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-20 py-2 border-b border-slate-50 dark:border-slate-900/50">
                {CHANNELS.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setChannelId(c.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${channelId === c.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                    >
                        #{c.name}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && posts.length === 0 && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}

            {/* Posts List */}
            {filteredPosts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    onClick={(id) => onPostClick(id)}
                    firebaseUid={firebaseUid}
                />
            ))}

            {/* Empty State */}
            {!loading && filteredPosts.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300">
                        <Book size={32} />
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-medium">No whispers found in this feed.</p>
                </div>
            )}
        </div>
    );
};

export default Feed;
