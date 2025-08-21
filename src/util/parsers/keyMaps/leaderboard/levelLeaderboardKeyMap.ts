import sharedKeyMap from './shared.js';

const levelLeaderboardKeyMap = {
    ...sharedKeyMap,
    percent: '3',
    age: '42',
} as const;

export default levelLeaderboardKeyMap;
