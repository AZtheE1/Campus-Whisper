import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    doc,
    deleteDoc,
    query,
    orderBy,
    runTransaction,
    increment,
    getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Post } from '../types';

export interface Report {
    id: string;
    postId: string;
    reason: string;
    timestamp: number;
    postContent?: string; // Optional, for display
    postAuthor?: string;
}

export const reportPost = async (postId: string, reason: string) => {
    try {
        await runTransaction(db, async (transaction) => {
            // Reference to global reports collection
            const reportRef = doc(collection(db, 'reports'));

            // Reference to the post
            const postRef = doc(db, 'posts', postId);
            const postDoc = await transaction.get(postRef);

            if (!postDoc.exists()) {
                throw new Error("Post does not exist");
            }

            // Create report
            transaction.set(reportRef, {
                postId,
                reason,
                timestamp: serverTimestamp()
            });

            // Increment flag count or set flag on post
            // For now, let's just mark it as flagged if it gets reported? 
            // Or just increment a report count. Let's increment reportCount.
            // If reportCount > 5, auto-flag.

            const currentReports = postDoc.data().reportCount || 0;
            const updates: any = {
                reportCount: increment(1)
            };

            if (currentReports + 1 >= 5) {
                updates.isFlagged = true;
            }

            transaction.update(postRef, updates);
        });
    } catch (error) {
        console.error("Error reporting post:", error);
        throw error;
    }
};

export const getReports = async (): Promise<Report[]> => {
    try {
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        const reports: Report[] = [];

        // This is not efficient for many reports, but fine for a small admin panel
        for (const d of snapshot.docs) {
            const data = d.data();
            const report: Report = {
                id: d.id,
                postId: data.postId,
                reason: data.reason,
                timestamp: data.timestamp?.toMillis() || Date.now()
            };

            // Fetch post details to show context
            try {
                const postSnap = await getDoc(doc(db, 'posts', report.postId));
                if (postSnap.exists()) {
                    report.postContent = postSnap.data().content;
                    report.postAuthor = postSnap.data().authorName;
                } else {
                    report.postContent = "[Deleted Post]";
                }
            } catch (e) {
                report.postContent = "[Error loading post]";
            }

            reports.push(report);
        }

        return reports;
    } catch (error) {
        console.error("Error getting reports:", error);
        return [];
    }
};

export const dismissReport = async (reportId: string) => {
    try {
        await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
        console.error("Error dismissing report:", error);
        throw error;
    }
};

export const deleteReportedPost = async (reportId: string, postId: string) => {
    try {
        await runTransaction(db, async (transaction) => {
            // Delete post
            transaction.delete(doc(db, 'posts', postId));
            // Delete report
            transaction.delete(doc(db, 'reports', reportId));
        });
    } catch (error) {
        console.error("Error deleting reported post:", error);
        throw error;
    }
};
