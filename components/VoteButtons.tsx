import React, { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { upvotePost, downvotePost } from '../services/postService';

interface VoteButtonsProps {
    postId: string;
    initialKarma: number;
    initialUserVote?: 'up' | 'down' | null;
    userId: string | null;
    onVoteError?: (error: string) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ postId, initialKarma, initialUserVote, userId, onVoteError }) => {
    const [optimisticKarma, setOptimisticKarma] = useState(initialKarma);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote || null);
    const [isVoting, setIsVoting] = useState(false);

    // Sync with server updates
    useEffect(() => {
        setOptimisticKarma(initialKarma);
    }, [initialKarma]);

    useEffect(() => {
        setUserVote(initialUserVote || null);
    }, [initialUserVote]);

    const handleVote = async (type: 'up' | 'down') => {
        if (!userId || isVoting) return;
        setIsVoting(true);

        const prevVote = userVote;
        const prevKarma = optimisticKarma;

        // Calculate optimistic state
        let newVote: 'up' | 'down' | null = type;
        let karmaChange = 0;

        if (prevVote === type) {
            // Toggle off
            newVote = null;
            karmaChange = type === 'up' ? -1 : 1;
        } else if (prevVote) {
            // Switch
            karmaChange = type === 'up' ? 2 : -2;
        } else {
            // New vote
            karmaChange = type === 'up' ? 1 : -1;
        }

        setOptimisticKarma(prev => prev + karmaChange);
        setUserVote(newVote);

        try {
            if (type === 'up') await upvotePost(postId, userId);
            else await downvotePost(postId, userId);
        } catch (error: any) {
            // Revert on failure
            setOptimisticKarma(prevKarma);
            setUserVote(prevVote);
            if (onVoteError) onVoteError(error.message);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1">
            <button
                onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
                disabled={!userId}
                className={`p-1.5 rounded-lg transition-all active:scale-125 ${userVote === 'up' ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 disabled:opacity-50'}`}
            >
                <ArrowBigUp size={20} fill={userVote === 'up' ? 'currentColor' : 'none'} />
            </button>
            <span className={`text-xs font-black px-1 min-w-[24px] text-center ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-indigo-500' : 'text-slate-600 dark:text-slate-400'}`}>
                {optimisticKarma}
            </span>
            <button
                onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
                disabled={!userId}
                className={`p-1.5 rounded-lg transition-all active:scale-125 ${userVote === 'down' ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 disabled:opacity-50'}`}
            >
                <ArrowBigDown size={20} fill={userVote === 'down' ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
};

export default VoteButtons;
