import { Client } from '../Client';
import { LeaderboardRecord, User } from '../structures';
import { RequestClient } from './RequestClient';
import { LeaderboardType, LevelLeaderboardType } from '../enums';
import { base64Encode, chk, generatePlatformerLeaderboardSeed, generateRandomString, gjp2, xor } from '../util';
import { parseLeaderboardRecords, parseUser } from '../util/parsers';
import { KEYS, SALTS } from '../constants';

export class LeaderboardClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async getLeaderboards(type: LeaderboardType) {
        const data = await this.baseRequest('getLeaderboards', { type });
        const dr = data.split('|');
        const d = dr.filter((e) => !!e);
        const users = d.map((u) => parseUser(u, this.client));

        return {
            users,
            emptyUsers: dr.length - d.length,
        };
    }

    public async getClassicLeaderboard(levelID: number, type: LevelLeaderboardType): Promise<LeaderboardRecord[]> {
        if (type === LevelLeaderboardType.FRIENDS && !this.client.auth)
            throw new Error('Cannot get friends scores without being authenticated');

        const data = await this.baseRequest('getLevelLeaderboards', {
            type,
            levelID,
            ...this.client.auth,
        });
        if (!data) throw new Error('No data returned');

        return data
            .split('|')
            .map((u) => parseLeaderboardRecords(u))
            .map(
                (record) =>
                    new LeaderboardRecord(
                        this.client,
                        record.name,
                        record.playerID,
                        record.accountID,
                        record.iconID,
                        record.color1,
                        record.color2,
                        record.iconType,
                        record.special,
                        record.percent,
                        record.secretCoins,
                        record.rank,
                        record.age,
                    ),
            );
    }

    public async getPlatformerLevelScores(
        levelID: number,
        type: number,
        mode = 1,
        opts: GetPlatformerLevelScoresOptions = {},
    ) {
        let bestAttemptTime = opts.bestAttemptTime;
        if (!bestAttemptTime) {
            if (opts.time) bestAttemptTime = Math.floor(opts.time / 1000);
            else bestAttemptTime = 0;
        }
        const s1 = (opts.attempts ?? 0) + 8354;
        const s2 = (opts.bestAttemptClicks ?? 0) + 3991;
        const s3 = bestAttemptTime + 4085;
        const s4 = generatePlatformerLeaderboardSeed(opts.time ?? 0, opts.points ?? 0);
        let s6 = '0';
        if (opts.percentages)
            s6 = opts.percentages
                .map((v, i, a) => {
                    let prev = a[i - 1];
                    if (!prev) prev = 0;
                    return v - prev;
                })
                .join(',');

        const s7 = generateRandomString(10);
        const s9 = (opts.coins ?? 0) + 5819;

        // accountID,levelID,percentage,bestAttemptTime,bestAttemptClicks,attempts,levelSeed,pbDiffs,1,coins,timelyID
        const values = [
            this.client.account?.accountID ?? 0,
            levelID,
            opts.percentage ?? 0,
            bestAttemptTime,
            opts.bestAttemptClicks ?? 0,
            opts.attempts ?? 0,
            s4,
            s6,
            1,
            opts.coins ?? 0,
            opts.timelyID ?? 0,
        ];
        const _chk = chk(values, KEYS.LEVEL_LEADERBOARD, SALTS.LEVEL_LEADERBOARDS + s7);
        const percentage = opts.percentage ?? 0;
        if (s6 == '0') s6 = percentage.toString();

        const parsedOptions = {
            time: opts.time ?? 0,
            points: opts.points ?? 0,
            plat: 1,
            mode,
            type,
            s1,
            s2,
            s3,
            s4: s4 + 1482,
            s5: 2000 + Math.floor(Math.random() * 1999),
            s6: base64Encode(xor(s6, KEYS.LEVEL)),
            s7,
            s8: opts.attempts ?? 0,
            s9,
            s10: opts.timelyID ?? 0,
            levelID,
            chk: _chk,
            accountID: this.client.account?.accountID,
            gjp2: gjp2(this.client.account?.password ?? ''),
            uuid: this.client.account?.playerID,
            udid: this.client.account?.udid,
            percent: percentage ? percentage : undefined,
        };

        const data = await this.baseRequest('getPlatformerLevelLeaderboards', parsedOptions);
        if (!data) throw new Error('No data returned');

        const scores = data.split('|').map((u) => parseUser(u, this.client)) as (User & {
            time?: number;
            points?: number;
        })[];
        for (const score of scores) {
            if (mode == 0) score.time = score.stars;
            else score.points = score.stars;
            //delete score.stars;
        }

        return scores;
    }
}

export interface GetPlatformerLevelScoresOptions {
    time?: number;
    attempts?: number;
    bestAttemptClicks?: number;
    bestAttemptTime?: number;
    percentages?: number[];
    percentage?: number;
    coins?: number;
    timelyID?: number;
    points?: number;
    plat?: number;
    mode?: number;
    type?: string;
}
