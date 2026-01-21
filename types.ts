
export interface User {
  id: string;
  username: string;
  karma: number;
  joinedAt: number;
  gender?: string;
  major?: string;
  bio?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  channelId: string;
  karma: number;
  commentCount: number;
  timestamp: number;
  userVote: 'up' | 'down' | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  karma: number;
  timestamp: number;
  userVote: 'up' | 'down' | null;
  parentId?: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

export type View = 'home' | 'channels' | 'my-posts' | 'profile' | 'post-detail' | 'admin';

export interface AppState {
  currentUser: User | null;
  currentView: View;
  selectedPostId: string | null;
}
