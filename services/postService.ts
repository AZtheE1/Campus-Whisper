import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    runTransaction,
    increment,
    deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Post } from '../types';

import { moderateContent } from './geminiService';

import { generateAnonymousName } from '../utils/nameGenerator';

export const createPost = async (content: string, channelId: string) => {
    try {
        // Moderation Check
        const moderation = await moderateContent(content);
        if (!moderation.isSafe) {
            throw new Error(moderation.reason || "Content violates community guidelines");
        }

        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User must be authenticated");

        const postsRef = collection(db, 'posts');
        const newPost = {
            content,
            channelId,
            timestamp: serverTimestamp(),
            karma: 0,
            commentCount: 0,
            anonymousId: Math.random().toString(36).substr(2, 9),
            authorName: generateAnonymousName(userId),
            isShadowBanned: false, // Default shadow ban status
            isFlagged: false,
            authorId: userId
        };

        await addDoc(postsRef, newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const getLivePosts = (channelId: string | null, callback: (posts: Post[]) => void) => {
    const constraints: any[] = [
        where('isFlagged', '==', false),
        where('isShadowBanned', '==', false),
        orderBy('timestamp', 'desc')
    ];

    // Only filter by channel if a specific channel is selected (and not 'all')
    if (channelId && channelId !== 'all') {
        constraints.unshift(where('channelId', '==', channelId));
    }

    const q = query(collection(db, 'posts'), ...constraints);

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis() || Date.now() // Handle serverTimestamp latency
        })) as Post[];

        callback(posts);
    });
};

// Helper to handle voting logic
const handleVote = async (postId: string, userId: string, type: 'up' | 'down') => {
    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(db, 'userVotes', `${userId}_${postId}`);

    try {
        await runTransaction(db, async (transaction) => {
            const voteDoc = await transaction.get(voteRef);

            if (voteDoc.exists()) {
                const currentVote = voteDoc.data().voteType;

                if (currentVote === type) {
                    // Remove vote (toggle off)
                    transaction.delete(voteRef);
                    transaction.update(postRef, {
                        karma: increment(type === 'up' ? -1 : 1)
                    });
                } else {
                    // Switch vote
                    transaction.update(voteRef, {
                        voteType: type,
                        timestamp: serverTimestamp()
                    });
                    transaction.update(postRef, {
                        karma: increment(type === 'up' ? 2 : -2)
                    });
                }
            } else {
                // New vote
                transaction.set(voteRef, {
                    userId,
                    postId,
                    voteType: type,
                    timestamp: serverTimestamp()
                });
                transaction.update(postRef, {
                    karma: increment(type === 'up' ? 1 : -1)
                });
            }
        });
    } catch (e) {
        console.error("Vote failed:", e);
        throw e;
    }
};

export const upvotePost = async (postId: string, userId: string) => {
    return handleVote(postId, userId, 'up');
};

export const downvotePost = async (postId: string, userId: string) => {
    return handleVote(postId, userId, 'down');
};

// ... existing imports
import { Comment } from '../types';

export const addComment = async (postId: string, content: string) => {
    try {
        // Moderation Check
        const moderation = await moderateContent(content);
        if (!moderation.isSafe) {
            throw new Error(moderation.reason || "Comment violates community guidelines");
        }

        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User must be authenticated");

        const commentsRef = collection(db, 'posts', postId, 'comments');
        const postRef = doc(db, 'posts', postId);

        await runTransaction(db, async (transaction) => {
            // Validate post exists
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw new Error("Post does not exist");

            const newCommentRef = doc(commentsRef);
            transaction.set(newCommentRef, {
                content,
                authorId: userId,
                authorName: generateAnonymousName(userId), // Consistent anon name
                timestamp: serverTimestamp(),
                karma: 0,
                postId
            });

            transaction.update(postRef, {
                commentCount: increment(1)
            });
        });

    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

export const getLiveComments = (postId: string, callback: (comments: Comment[]) => void) => {
    const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('timestamp', 'asc') // Oldest first for threads
    );

    return onSnapshot(q, (snapshot) => {

        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            postId,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis() || Date.now()
        })) as Comment[];

        callback(comments);
    });
};

// ... existing imports

export const getPost = (postId: string, callback: (post: Post | null) => void) => {
    return onSnapshot(doc(db, 'posts', postId), (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toMillis() || Date.now()
            } as Post);
        } else {
            callback(null);
        }
    });
};

export const getLiveUserVotes = (userId: string, callback: (votes: Record<string, 'up' | 'down'>) => void) => {
    const q = query(collection(db, 'userVotes'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const votes: Record<string, 'up' | 'down'> = {};
        snapshot.docs.forEach(doc => {
            votes[doc.data().postId] = doc.data().voteType;
        });
        callback(votes);
    });
};

export const deletePost = async (postId: string) => {
    try {
        await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};
