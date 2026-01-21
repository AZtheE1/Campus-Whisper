import {
    ref,
    onDisconnect,
    set,
    remove,
    onValue,
    off
} from 'firebase/database';
import { rtdb } from './firebase';

// Enter a channel: Set presence and schedule disconnect removal
export const enterChannel = (channelId: string, userId: string, nickname: string) => {
    const presenceRef = ref(rtdb, `presence/${channelId}/${userId}`);

    // Create presence record
    set(presenceRef, {
        nickname,
        enteredAt: Date.now(),
        status: 'online'
    });

    // Auto-remove on disconnect (closing app/tab)
    onDisconnect(presenceRef).remove();
};

// Leave a channel: Manually remove presence (navigation)
export const leaveChannel = (channelId: string, userId: string) => {
    const presenceRef = ref(rtdb, `presence/${channelId}/${userId}`);
    remove(presenceRef);
};

// Subscribe to active users in a channel
export const subscribeToChannelPresence = (channelId: string, callback: (count: number) => void) => {
    const channelRef = ref(rtdb, `presence/${channelId}`);

    const listener = onValue(channelRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Count keys (user IDs)
            callback(Object.keys(data).length);
        } else {
            callback(0);
        }
    });

    // Return unsusbcribe function
    return () => off(channelRef, 'value', listener);
};
