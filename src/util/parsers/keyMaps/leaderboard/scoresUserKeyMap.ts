import sharedKeyMap from './shared.js';

const scoresUserKeyMap = {
    ...sharedKeyMap,
    demons: '4',
    stars: '3',
    moons: '52',
    diamonds: '46',
    userCoins: '17',
    creatorPoints: '8',
} as const;

export default scoresUserKeyMap;
