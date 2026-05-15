import { levelLeaderboardKeyMap } from '.';
import { parseIntAssert } from '.';
import { robTopSplit } from '..';

export function parseLeaderboardRecords(str: string) {
    const raw = robTopSplit(str, ':');

    if (!raw.get(levelLeaderboardKeyMap.name)) throw new Error('Parsing error: Leaderboard record name is missing.');
    if (!raw.get(levelLeaderboardKeyMap.age)) throw new Error('Parsing error: Leaderboard record age is missing.');

    return {
        name: raw.get(levelLeaderboardKeyMap.name)!,
        playerID: parseIntAssert(raw.get(levelLeaderboardKeyMap.playerID)),
        accountID: parseIntAssert(raw.get(levelLeaderboardKeyMap.accountID)),
        iconID: parseIntAssert(raw.get(levelLeaderboardKeyMap.iconID)),
        color1: parseIntAssert(raw.get(levelLeaderboardKeyMap.color1)),
        color2: parseIntAssert(raw.get(levelLeaderboardKeyMap.color2)),
        iconType: parseIntAssert(raw.get(levelLeaderboardKeyMap.iconType)),
        special: parseIntAssert(raw.get(levelLeaderboardKeyMap.special)),
        percent: parseIntAssert(raw.get(levelLeaderboardKeyMap.percent)),
        secretCoins: parseIntAssert(raw.get(levelLeaderboardKeyMap.secretCoins)),
        rank: parseIntAssert(raw.get(levelLeaderboardKeyMap.rank)),
        age: raw.get(levelLeaderboardKeyMap.age)!,
    };
}
