import { levelLeaderboardKeyMap } from '.';
import { robTopSplit } from '..';

export function parseLeaderboardRecords(str: string) {
    const raw = robTopSplit(str, ':');

    return {
        name: raw.getOrThrow(levelLeaderboardKeyMap.name, 'Parsing error: Leaderboard record name is missing.'),
        playerID: raw.getIntOrThrow(levelLeaderboardKeyMap.playerID),
        accountID: raw.getIntOrThrow(levelLeaderboardKeyMap.accountID),
        iconID: raw.getIntOrThrow(levelLeaderboardKeyMap.iconID),
        color1: raw.getIntOrThrow(levelLeaderboardKeyMap.color1),
        color2: raw.getIntOrThrow(levelLeaderboardKeyMap.color2),
        iconType: raw.getIntOrThrow(levelLeaderboardKeyMap.iconType),
        special: raw.getIntOrThrow(levelLeaderboardKeyMap.special),
        percent: raw.getIntOrThrow(levelLeaderboardKeyMap.percent),
        secretCoins: raw.getIntOrThrow(levelLeaderboardKeyMap.secretCoins),
        rank: raw.getIntOrThrow(levelLeaderboardKeyMap.rank),
        age: raw.getOrThrow(levelLeaderboardKeyMap.age, 'Parsing error: Leaderboard record age is missing.'),
    };
}
