import { GenericRequestOptions } from './generic';
import {
    base64Encode,
    chk,
    generateGauntletsHash,
    generateMapPacksHash,
    generateRandomString,
    generateUploadSeed2,
    gjp2,
    robTopSplit,
    robTopSplitDict,
} from '../util';
import { Client } from '../Client';
import { PaginationOptions } from '../interfaces/PaginationOptions';
import { CommentResult } from './CommentClient';
import { Comment, Level } from '../structures';
import { GetLevelsOptions } from '../interfaces/GetLevelsOptions';
import { RequestClient } from './RequestClient';
import { LevelSearchType } from '../enums';
import { type TinyUser } from '../types/TinyUser';
import { parseLevel, parseMapPack, parseSongs, parseUsers } from '../util/parsers';
import type { Song } from '../types/Song';
import { KEYS, SALTS, SECRETS } from '../constants';

export interface UploadLevelOptions {
    id?: number;
    name: string;
    description?: string;
    unlistedMode?: number;
    version?: number;
    requestedStars?: number;
    levelString: string;
    length?: number;
    originalID?: number;
    twoPlayer?: boolean;
    objects?: number;
    coins?: number;
    hasLowDetailMode?: boolean;
    password?: boolean;
    officialSongID?: number;
    songID?: number;
    verificationTime?: number;
    editorTime?: number;
    copiesEditorTime?: number;
    songIDs?: number[];
    sfxIDs?: number[];
}

export interface GetLevelsResponse {
    levels: Level[];
    songs?: Record<string, Song>;
    users: Record<string, TinyUser>;
    total: number;
    offset: number;
    pageSize: number;
    hash: string;
    isHashValid: boolean;
    date: number;
}

export class LevelClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async upload(opts: UploadLevelOptions) {
        if (!this.client.auth || !this.client.account)
            throw new Error('You must authenticate in order to upload a level');

        const parsedOptions = {
            ...this.client.auth,
            userName: this.client.account.username,
            levelID: opts.id ?? 0,
            levelName: opts.name,
            levelDesc: opts.description ? base64Encode(opts.description) : '',
            unlisted: opts.unlistedMode ?? 0,
            levelVersion: opts.version ?? 1,
            requestedStars: opts.requestedStars ?? 0,
            levelString: opts.levelString,
            levelLength: opts.length ?? 0,
            original: opts.originalID ?? 0,
            twoPlayer: Number(!!opts.twoPlayer),
            objects: opts.objects ?? 0,
            coins: opts.coins ?? 0,
            ldm: Number(!!opts.hasLowDetailMode),
            password:
                opts.password != null && opts.password != undefined
                    ? Number(opts.password)
                    : 0 /*(instance.binaryVersion > 37 ? 1 : 0)*/, // free to copy by default on 2.201+, no copy by default on 2.200-
            audioTrack: opts.officialSongID ?? 0,
            songID: opts.songID ?? 0,
            ts: opts.verificationTime ?? 0,
            songIDs: opts.songIDs?.join(','),
            sfxIDs: opts.sfxIDs?.join(','),
            auto: 0,
            wt: opts.editorTime ?? 0,
            wt2: opts.copiesEditorTime ?? 0,
            seed: generateRandomString(10),
            seed2: generateUploadSeed2(opts.levelString),
            uuid: this.client.account.playerID,
            udid: this.client.account.udid,
        };

        const ID = await this.baseRequest('uploadLevel', parsedOptions);
        if (ID == '-1') throw new Error('-1');
        return ID;
    }

    public async download(levelID: number, increment = false) {
        const opt = {
            levelID,
        };

        const creds: {
            rs: string;
            udid?: string;
            uuid?: string | number;
            gjp2?: string;
            accountID?: number;
            inc?: number;
            chk?: string;
        } = {
            rs: generateRandomString(10),
        };

        if (this.client.account) {
            creds.udid = this.client.account.udid;
            creds.uuid = this.client.account.playerID;
            creds.gjp2 = gjp2(this.client.account.password);
            creds.accountID = this.client.account.accountID;
            creds.inc = Number(!!increment);
            creds.chk = chk(
                [levelID, creds.inc, creds.rs, this.client.account.accountID, creds.udid, creds.uuid],
                KEYS.LEVEL,
                SALTS.LEVEL,
            );
            // delete params.udid
            // delete params.uuid
            // delete params.chk
            // delete params.inc
            // delete params.gjp2
            // delete params.rs
            // delete params.gjp
            // delete params.accountID
        } else if (increment) throw new Error('Must authenticate with an account to increment');

        const combinedOptions = {
            ...opt,
            ...creds,
        };
        const data = await this.baseRequest('downloadLevel', combinedOptions);
        const segments = data.split('#');

        const level = parseLevel(this.client, segments[0]);

        const hashes = segments.slice(1, 3);
        const json: DownloadLevelResponse = {
            level,
            hashes,
        };
        if (segments[3]) {
            json.unk_segment_4 = segments[3];
        }
        if (segments[4]) {
            json.songs = parseSongs(segments[4]);
        }
        if (segments[5]) {
            json.extraArtists = robTopSplitDict(segments[5], ',');
        }

        return json;
    }

    public async downloadDaily(increment = false) {
        return this.download(-1, increment);
    }

    public async downloadWeekly(increment = false) {
        return this.download(-2, increment);
    }

    public async downloadEvent(increment = false) {
        return this.download(-3, increment);
    }

    /**
     * Gets levels from a Geometry Dash server.
     * @param {object} opts The options for the request
     */
    public async getLevels(opts: GetLevelsOptions, params: GenericRequestOptions = {}) {
        const diffMap = {
            '-1': -3,
            0: -1,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: -2,
            7: -2,
            8: -2,
            9: -2,
            10: -2,
        } as const;

        const diff: {
            diff?: number | string;
            demonFilter?: number;
        } = {};
        if (opts.difficulties && opts.difficulties.length > 0) {
            const diffs = opts.difficulties.map((d) => diffMap[d as keyof typeof diffMap] || 0);
            if (opts.difficulties.length > 1) {
                if (diffs.includes(-2)) throw new Error('Only one demon difficulty can be searched at a time');
                diff.diff = Array.from(new Set(diffs)).join(',');
            } else if (diffs[0] == -2) {
                opts.demonFilter = opts.difficulties[0] - 5;
            } else {
                diff.diff = Number(diffs[0]);
            }
        }

        let str = opts.query ?? '';
        if (opts.type == LevelSearchType.BY_PLAYER && opts.playerID) str = opts.playerID.toString();
        else if ((opts.type == LevelSearchType.RATED || opts.type == LevelSearchType.BY_ID) && opts.levelIDs)
            str = opts.levelIDs.join(',');
        else if (opts.type == LevelSearchType.FROM_LIST && opts.listID) str = opts.listID.toString();

        if (opts.type == LevelSearchType.FRIENDS) {
            if (!this.client.account) throw new Error('Must be authorized to get friend levels');
        }

        const parsedOptions: Record<string, string | number> = {
            page: opts.page ?? 0,
            count: opts.count ?? 10,
            type: opts.type ?? 2,
            str,
            noStar: Number(!!opts.unrated) || 0,
            star: Number(!!opts.rated) || 0,
            featured: Number(!!opts.featured) || 0,
            epic: Number(!!opts.epic) || 0,
            legendary: Number(!!opts.legendary) || 0,
            mythic: Number(!!opts.mythic) || 0,
            coins: Number(!!opts.coins) || 0,
            twoPlayer: Number(!!opts.twoPlayer) || 0,
            original: Number(!!opts.original) || 0,
            followed: opts.accountIDs ? opts.accountIDs.join(',') : '',
            uncompleted: opts.uncompleted ? '1' : '0',
            onlyCompleted: opts.completed ? '1' : '0',
            completedLevels: opts.uncompleted || opts.completed ? `(${opts.levelIDs?.join(',')})` : '',
            customSong: opts.customSong ?? 0,
            song: opts.songID ?? 0,
            demonFilter: diff.demonFilter ?? 0,
            ...this.client.auth,
        };

        if (diff.diff) parsedOptions.diff = diff.diff;
        if (opts.length) parsedOptions.len = opts.length;

        const data = await this.baseRequest('getLevels', parsedOptions, params);
        const segments = data.split('#');

        const levels = segments[0]?.split('|').map((l) => parseLevel(this.client, l));
        const users = segments[1];
        const songs = parseSongs(segments[2]);
        const pages = segments[3].split(':').map(Number);

        return {
            levels,
            songs,
            users: parseUsers(users),
            total: pages[0],
            offset: pages[1],
            pageSize: pages[2],
        };
    }

    public async getMostDownloadedLevels() {
        return await this.getLevels({ type: 1 });
    }

    public async getMostLikedLevels() {
        return await this.getLevels({ type: 2 });
    }

    public async getTrendingLevels() {
        return await this.getLevels({ type: 3 });
    }

    public async getRecentLevels() {
        return await this.getLevels({ type: 4 });
    }

    public async getFeaturedLevels() {
        return await this.getLevels({ type: 6 });
    }

    public async getMagicLevels() {
        return await this.getLevels({ type: 7 });
    }

    public async getSentLevelsOld() {
        return await this.getLevels({ type: 8 });
    }

    public async getAwardedLevels() {
        return await this.getLevels({ type: 11 });
    }

    public async getFriendLevels() {
        return await this.getLevels({ type: 13 });
    }

    public async getMostLikedWorldLevels() {
        return await this.getLevels({ type: 15 });
    }

    public async getHallOfFameLevels() {
        return await this.getLevels({ type: 16 });
    }

    public async getFeaturedWorldLevels() {
        return await this.getLevels({ type: 17 });
    }

    public async getOldDailyLevels() {
        return await this.getLevels({ type: 21 });
    }

    public async getOldWeeklyLevels() {
        return await this.getLevels({ type: 22 });
    }

    public async getLevelsFromList() {
        return await this.getLevels({ type: 25 });
    }

    public async getSentLevels() {
        return await this.getLevels({ type: 27 });
    }

    public async getMapPacks(params: GenericRequestOptions & { page?: number } = {}) {
        const data = await this.baseRequest('getMapPacks', {}, params);
        const segments = data.split('#');
        const packsRaw = segments[0].split('|');
        const pages = segments[1].split(':');
        const hash = segments[2];
        const packs = [];
        for (const pack of packsRaw) {
            packs.push(parseMapPack(pack));
        }

        return {
            packs,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
            hash,
            isHashValid: generateMapPacksHash(packs) == hash,
        };
    }

    public async getGauntlets() {
        const data = await this.baseRequest('getGauntlets', { special: 1 });

        const segments = data.split('#');
        const packsRaw = segments[0].split('|');
        const hash = segments[1];
        const packs = [];

        for (const pack of packsRaw) {
            const splitPack = robTopSplit(pack, ':');
            packs.push({
                ID: Number(splitPack.get('1')),
                levelIDs: splitPack.get('3')!.split(',').map(Number),
            });
        }

        return {
            packs,
            hash,
            isHashValid: generateGauntletsHash(packs) == hash,
        };
    }

    public async getDaily() {
        const data = await this.baseRequest('getDailyLevel');
        return {
            dailyID: Number(data.split('|')[0]),
            timeLeft: Number(data.split('|')[1]),
        };
    }

    public async getWeekly() {
        const data = await this.baseRequest('getDailyLevel', { weekly: 1 });
        return {
            dailyID: Number(data.split('|')[0]),
            timeLeft: Number(data.split('|')[1]),
        };
    }

    public async getComments(levelID: number, paginationOptions: PaginationOptions = {}): Promise<CommentResult> {
        const data = await this.baseRequest('getComments', {
            levelID,
            ...paginationOptions,
        });
        if (Number(data) < 0) {
            return {
                comments: [],
                total: 0,
                offset: 0,
                pageSize: 0,
            };
        }

        const segments = data.split('#');
        const comments = segments[0].split('|').map((c) => new Comment(this.client, c + `~1~${levelID}`));
        const pages = segments[1].split(':');
        return {
            comments,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        };
    }

    public async updateDescription(levelID: number, description: string) {
        if (!this.client.account) throw new Error("You must authenticate in order to update a level's description");

        return await this.baseRequest('updateDescription', {
            levelID,
            levelDesc: base64Encode(description),
            accountID: this.client.account.accountID,
            gjp2: gjp2(this.client.account.password),
        });
    }

    public async rateDemon(levelID: number, rating: number, instance: Client, params: GenericRequestOptions = {}) {
        if (!instance.account) throw new Error('You must authenticate in order to send rate suggestions for levels');

        return await this.baseRequest(
            'rateDemon',
            {
                levelID,
                rating,
                accountID: instance.account.accountID,
                gjp2: gjp2(instance.account.password),
            },
            {
                secret: params.secret ?? SECRETS.MOD,
                ...params,
            },
        );
    }

    public async rateLevel(levelID: number, stars: number) {
        if (!this.client.account) throw new Error('You must authenticate in order to send rate suggestions for levels');

        const randomString = generateRandomString(10);
        const chkThing = chk(
            [
                levelID,
                stars,
                randomString,
                this.client.account.accountID,
                this.client.account.udid,
                this.client.account.playerID,
            ],
            KEYS.RATE,
            SALTS.LIKE_OR_RATE,
        );

        return await this.baseRequest('rateLevel', {
            levelID,
            stars,
            chk: chkThing,
            rs: randomString,
            udid: this.client.account.udid,
            uuid: this.client.account.playerID,
            accountID: this.client.account.accountID,
            gjp2: gjp2(this.client.account.password),
        });
    }

    public async reportLevel(levelID: number) {
        const data = await this.baseRequest('reportLevel', { levelID });
        if (Number(data) > 0) return data;
        else throw new Error(data);
    }

    public async delete(levelID: number) {
        if (!this.client.account) throw new Error('You must authenticate in order to delete a level');

        const data = await this.baseRequest('deleteLevel', {
            levelID,
            accountID: this.client.account.accountID,
            gjp2: gjp2(this.client.account.password),
        });

        if (data == '-1') throw new Error('-1');
        return data;
    }

    public toJSON() {
        return {};
    }
}

export interface GauntletPack {
    ID: number;
    levelIDs: number[];
}

export interface DownloadLevelResponse {
    level: Level;
    hashes: string[];
    unk_segment_4?: string;
    songs?: Record<string, Song>;
    extraArtists?: Record<string, string>;
}
