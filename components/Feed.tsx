import React, { useState, useEffect, useMemo } from 'react';
import { Post, User, View } from '../types';
import { getLivePosts, getLiveUserVotes } from '../services/postService';
import { enterChannel, leaveChannel, subscribeToChannelPresence } from '../services/presenceService';
import PostCard from './PostCard';
import { Book, Users } from 'lucide-react';
import { CHANNELS } from '../constants';

interface FeedProps {
    view: View;
    user: User | null; // For identifying "my posts"
    searchQuery: string;
    channelId: string | null;
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
    const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
    const [loading, setLoading] = useState(true);
    const [onlineCount, setOnlineCount] = useState(0);

    // Live subscription to Firestore Posts
    useEffect(() => {
        setPosts([]); // Clear posts to show loading state
        setLoading(true);
        const unsubscribe = getLivePosts(channelId, (newPosts) => {
            setPosts(newPosts);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [channelId]);

    // Live Presence Tracking
    useEffect(() => {
        if (!channelId || !firebaseUid || !user?.username) return;

        // Enter Channel
        enterChannel(channelId, firebaseUid, user.username);

        // Listen for updates
        const unsubscribe = subscribeToChannelPresence(channelId, (count) => {
            setOnlineCount(count);
        });

        return () => {
            // Leave Channel
            leaveChannel(channelId, firebaseUid);
            unsubscribe();
        };
    }, [channelId, firebaseUid, user?.username]);

    // Live subscription to User Votes
    useEffect(() => {
        if (!firebaseUid) return;
        const unsubscribe = getLiveUserVotes(firebaseUid, (newVotes) => {
            setVotes(newVotes);
        });
        return () => unsubscribe();
    }, [firebaseUid]);

    // Client-side filtering & Merging Votes
    const filteredPosts = useMemo(() => {
        let list = posts.map(p => ({
            ...p,
            userVote: votes[p.id] || null
        }));

        if (view === 'my-posts' && user) {
            list = list.filter(p => p.authorId === user.id);
        }
        if (searchQuery) {
            // ...
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
            {/* Channel Header & Online Status */}
            {channelId && channelId !== 'all' && (
                <div className="px-4 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        {CHANNELS.find(c => c.id === channelId)?.name || 'Feed'}
                    </span>
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        <div className="relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full relative z-10"></div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {onlineCount} Online
                        </span>
                    </div>
                </div>
            )}



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
                    <p className="text-slate-400 dark:text-slate-600 font-medium">No posts in this department yet.</p>
                </div>
            )}
        </div>
    );
};

export default Feed;
