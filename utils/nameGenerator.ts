const ADJECTIVES = [
    'Silent', 'Green', 'Ancient', 'Brave', 'Calm', 'Rapid', 'Bright', 'Daring', 'Eager', 'Fierce',
    'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively', 'Misty', 'Noble', 'Proud', 'Quiet', 'Royal',
    'Shiny', 'Tough', 'Urban', 'Vivid', 'Wild', 'Young', 'Zealous', 'Sunny', 'Windy', 'Snowy'
];

const ANIMALS = [
    'Tiger', 'Owl', 'Bear', 'Lion', 'Wolf', 'Fox', 'Eagle', 'Hawk', 'Falcon', 'Deer',
    'Panda', 'Koala', 'Leopard', 'Cheetah', 'Elephant', 'Giraffe', 'Zebra', 'Horse', 'Raven', 'Crow',
    'Swan', 'Duck', 'Goose', 'Penguin', 'Seal', 'Whale', 'Dolphin', 'Shark', 'Crab', 'Dragon'
];

export const generateAnonymousName = (uid: string): string => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }

    const adjIndex = Math.abs(hash) % ADJECTIVES.length;
    const animalIndex = Math.abs(hash >> 5) % ANIMALS.length; // Shift to get a different combined index

    return `${ADJECTIVES[adjIndex]} ${ANIMALS[animalIndex]}`;
};
