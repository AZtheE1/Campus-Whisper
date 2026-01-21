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

export const getLivePosts = (channelId: string, callback: (posts: Post[]) => void) => {
    const q = query(
        collection(db, 'posts'),
        where('channelId', '==', channelId),
        where('isFlagged', '!=', true),
        where('isShadowBanned', '!=', true),
        orderBy('timestamp', 'desc')
    );

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

export const deletePost = async (postId: string) => {
    try {
        await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};
