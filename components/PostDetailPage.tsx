import React, { useState, useEffect } from 'react';
import { User, Post, Comment } from '../types';
import PostCard from './PostCard';
import { ChevronRight, AlertCircle, Send } from 'lucide-react';
import { getPost, getLiveComments, getLiveUserVotes, addComment } from '../services/postService';

interface PostDetailPageProps {
    postId: string;
    onBack: () => void;
    user: User;
    firebaseUid: string | null;
}

const PostDetailPage: React.FC<PostDetailPageProps> = ({ postId, onBack, user, firebaseUid }) => {
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorObj, setErrorObj] = useState<string | null>(null);
    const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});

    useEffect(() => {
        const unsubPost = getPost(postId, (p) => setPost(p));
        const unsubComments = getLiveComments(postId, (c) => setComments(c));
        let unsubVotes = () => { };

        if (firebaseUid) {
            unsubVotes = getLiveUserVotes(firebaseUid, (v) => setVotes(v));
        }

        return () => {
            unsubPost();
            unsubComments();
            unsubVotes();
        };
    }, [postId, firebaseUid]);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        setErrorObj(null);

        try {
            await addComment(postId, newComment);
            setNewComment('');
        } catch (e: any) {
            if (e.message.includes("Community Guidelines")) {
                setErrorObj(e.message);
            } else {
                alert("Failed to post comment: " + e.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) return <div className="p-10 text-center text-slate-400">Loading...</div>;

    const postWithVote = { ...post, userVote: votes[post.id] || null };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 border-b border-slate-50 dark:border-slate-900 flex items-center">
                <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 text-xs font-black px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center gap-1 active:scale-95 transition-all">
                    <ChevronRight className="rotate-180" size={14} /> Back
                </button>
            </div>
            <PostCard post={postWithVote} onClick={() => { }} firebaseUid={firebaseUid} />

            <div className="p-4 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6 px-4">Thread Comments ({comments.length})</h4>

                {errorObj && (
                    <div className="mx-4 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorObj}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {comments.map(c => (
                        <div key={c.id} className="mx-4 pl-4 border-l-2 border-indigo-500/20 dark:border-slate-800 animate-in slide-in-from-left duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{c.authorName}</span>
                                <span className="text-[10px] font-medium text-slate-300 dark:text-slate-700">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">{c.content}</p>
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

export default PostDetailPage;
