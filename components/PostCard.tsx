
import React from 'react';
import { MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';
import VoteButtons from './VoteButtons';

interface PostCardProps {
  post: Post;
  onVote?: any; // Deprecated
  onClick: (postId: string) => void;
  firebaseUid: string | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, firebaseUid }) => {
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing not supported on this browser");
    }
  };

  return (
    <div
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 mb-3 mx-4 shadow-sm hover:shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer group"
      onClick={() => onClick(post.id)}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-slate-800 flex items-center justify-center text-xs font-black text-white shadow-inner">
          {post.authorName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{post.authorName}</span>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-tight">#{post.channelId} • {timeAgo(post.timestamp)}</span>
        </div>
        <button className="ml-auto p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <h3 className="font-extrabold text-lg mb-2 leading-snug text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-5 leading-relaxed">
        {post.content}
      </p>

      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-4">
        <div className="flex items-center gap-4">
          <VoteButtons
            postId={post.id}
            initialKarma={post.karma}
            userId={firebaseUid}
          />

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors">
            <MessageCircle size={18} />
            <span className="text-xs font-bold">{post.commentCount}</span>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-2 text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
