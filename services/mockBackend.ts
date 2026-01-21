
import { Post, Comment, User } from '../types';

// Storage Keys
const POSTS_KEY = 'cw_posts';
const COMMENTS_KEY = 'cw_comments';
const USER_KEY = 'cw_user';

export const getStoredPosts = (): Post[] => {
  const data = localStorage.getItem(POSTS_KEY);
  if (!data) {
    const initialPosts: Post[] = [
      {
        id: '1',
        authorId: 'system',
        authorName: 'WhisperingOwl',
        title: 'Welcome to Campus Whisper!',
        content: 'This is a safe space for all university students. Be respectful and stay anonymous.',
        channelId: 'general',
        karma: 42,
        commentCount: 2,
        timestamp: Date.now() - 3600000,
        userVote: null
      },
      {
        id: '2',
        authorId: 'system',
        authorName: 'CampusGhost',
        title: 'CS 101 Midterm is brutal',
        content: 'Anyone else struggling with the recursion problems? I feel like I am stuck in a loop... literally.',
        channelId: 'cs-help',
        karma: 15,
        commentCount: 5,
        timestamp: Date.now() - 7200000,
        userVote: null
      }
    ];
    localStorage.setItem(POSTS_KEY, JSON.stringify(initialPosts));
    return initialPosts;
  }
  return JSON.parse(data);
};

export const savePost = (post: Post) => {
  const posts = getStoredPosts();
  localStorage.setItem(POSTS_KEY, JSON.stringify([post, ...posts]));
};

export const updatePostKarma = (postId: string, vote: 'up' | 'down' | null) => {
  const posts = getStoredPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    const oldVote = posts[index].userVote;
    let karmaChange = 0;

    // Remove old vote effect
    if (oldVote === 'up') karmaChange -= 1;
    if (oldVote === 'down') karmaChange += 1;

    // Add new vote effect
    if (vote === 'up') karmaChange += 1;
    if (vote === 'down') karmaChange -= 1;

    posts[index].karma += karmaChange;
    posts[index].userVote = vote;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
};

export const getStoredComments = (postId: string): Comment[] => {
  const data = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = data ? JSON.parse(data) : [];
  return allComments.filter(c => c.postId === postId);
};

export const saveComment = (comment: Comment) => {
  const data = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = data ? JSON.parse(data) : [];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify([comment, ...allComments]));
  
  // Update post comment count
  const posts = getStoredPosts();
  const pIdx = posts.findIndex(p => p.id === comment.postId);
  if (pIdx !== -1) {
    posts[pIdx].commentCount += 1;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
};

export const updateUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
