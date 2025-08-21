import * as constants from './constants.js';
import crypto from 'node:crypto';
import * as zlib from 'node:zlib';
import { GauntletPack } from './server/LevelClient.js';
import Client from './Client.js';
import Level from './structures/Level.js';
import User from './structures/User.js';
import remapKeys from './util/remapKeys.js';
import parseIntAssert from './util/parsers/parseIntAssert.js';
import scoresUserKeyMap from './util/parsers/keyMaps/leaderboard/scoresUserKeyMap.js';
import parseIntUndefined from './util/parsers/parseIntUndefined.js';

/**
 * Generates a SHA-1 hash of the given string.
 *
 * @param {string} str - The input string to hash.
 * @param {crypto.BinaryToTextEncoding} [digestType="hex"] - The encoding of the output hash. Defaults to "hex".
 * @returns {string} The SHA-1 hash of the input string in the specified encoding.
 */
export function sha1(str: string, digestType: crypto.BinaryToTextEncoding = 'hex'): string {
    const hash = crypto.createHash('sha1');
    hash.update(str);
    return hash.digest(digestType);
}

export function md5(str: string, digestType: crypto.BinaryToTextEncoding = 'hex') {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest(digestType);
}

export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function md5Buffer(str: string) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest();
}

export function gjp(str: string) {
    return base64Encode(xor(str, constants.KEYS.ACCOUNT_PASSWORD));
}

export function gjp2(str: string) {
    return sha1(str + constants.SALTS.GJP2);
}

export function xor(str: string, key: string) {
    return str
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
        .join('');
}

/**
 * Converts a string array of key value pairs seperated by a character into a map
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Map<string, string>} The map of key value pairs
 */
export function robTopSplit(str: string, sep: string): Map<string, string> {
    const map = new Map<string, string>();
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        map.set(arr[i], arr[i + 1]);
    }
    return map;
}

/**
 * Similar to {@link robTopSplit} but returns an object instead of a map
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Record<string, string>} The object of keys and their values
 */
export function robTopSplitDict(str: string, sep: string): Record<string, string> {
    const object: Record<string, string> = {};
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        object[arr[i]] = arr[i + 1];
    }
    return object;
}

/**
 * Generates a random string of a specified length using the provided character set.
 * If no character set is provided, a default set of characters is used.
 *
 * @param {number} n - The length of the random string to generate.
 * @param {string[]} [charset] - An optional array of characters to use for generating the random string.
 * @returns {string} A random string of length `n` composed of characters from the `charset`.
 */
export function rs(n: number, charset = constants.RS_CHARACTERS): string {
    return new Array(n)
        .fill('0')
        .map((_) => charset[Math.floor(Math.random() * charset.length)])
        .join('');
}

export function base64Encode(str: string) {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

export function base64EncodeBuffer(str: Buffer): string {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

export function base64Decode(str: string) {
    return Buffer.from(str.replace(/\+/g, '-').replace(/\//g, '_'), 'base64url').toString('ascii');
}

export function base64DecodeBuffer(str: string) {
    return Buffer.from(str.replace(/\+/g, '-').replace(/\//g, '_'), 'base64url');
}

export function generateCDNToken(endpoint: string, expires: number) {
    return base64EncodeBuffer(md5Buffer(`${constants.LIBRARY_SECRET}${endpoint}${expires}`)).replace(/=/g, '');
}

export function generateHSV(h: number, s: number, v: number, s_checked: boolean, v_checked: boolean) {
    return `${h}a${s}a${v}a${s_checked ? 1 : 0}a${v_checked ? 1 : 0}`;
}

export function chk(values: (string | number)[], key: string, salt = '') {
    const str = values.join('') + salt;
    return base64Encode(xor(sha1(str), key));
}

export interface Song {
    name: string;
    artistID: number;
    artistName: string;
    size: number;
    isVerified: boolean;
    link?: string;
    videoID?: string;
    artistYoutubeURL?: string;
    priority?: number;
    nongType?: number;
    extraArtistIDs?: number[];
    newButtonType?: number;
    extraArtistNames?: string;
    new: boolean;
}

export function parseSongs(str: string) {
    const songs: Record<string, Song> = {};

    for (const i of str.split('~:~')) {
        const responseMap = robTopSplit(i, '~|~');
        const songID = responseMap.get('1');
        if (!songID) continue;

        const name = responseMap.get('2');
        if (!name) throw new Error('Parsing error: Song name is missing.');
        const artistName = responseMap.get('4');
        if (!artistName) throw new Error('Parsing error: Artist name is missing.');

        const song: Song = {
            name,
            artistID: Number(responseMap.get('3')),
            artistName,
            size: Number(responseMap.get('5')),
            isVerified: !!Number(responseMap.get('8')),
            new: !!Number(responseMap.get('13')),
        };
        if (responseMap.get('6')) song.videoID = responseMap.get('6');
        if (responseMap.get('7')) song.artistYoutubeURL = responseMap.get('7');
        if (responseMap.get('9')) song.priority = Number(responseMap.get('9'));
        if (responseMap.get('10')) song.link = decodeURIComponent(responseMap.get('10')!);
        if (responseMap.get('11') != undefined) song.nongType = Number(responseMap.get('11'));
        if (responseMap.get('12'))
            song.extraArtistIDs = responseMap
                .get('12')!
                .split('.')
                .map((e) => Number(e));
        if (responseMap.get('14')) song.newButtonType = Number(responseMap.get('14'));
        if (responseMap.get('15')) song.extraArtistNames = responseMap.get('15');

        // for (const i of responseMap.keys()) {
        //     if (!(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"].includes(i))) {
        //         json[`unk_${i}`] = responseMap.get(i);
        //     }
        // }

        songs[songID] = song;
    }

    return songs;
}

export interface Artist {
    name: string;
    youtube?: string;
    [key: string]: string | undefined;
}

export function parseArtists(str: string): Artist[] {
    const artists: Artist[] = [];
    for (const i of str.split('|')) {
        const responseMap = robTopSplit(i, ':');
        const name = responseMap.get('4');
        if (!name) continue;

        const artist: Artist = { name };
        if (responseMap.get('7')) artist.youtube = responseMap.get('7');
        for (const i of responseMap.keys()) {
            if (i != '4' && i != '7') {
                artist[`unk_${i}`] = responseMap.get(i);
            }
        }
        artists.push(artist);
    }
    return artists;
}

export function xorDecode(str: string, key: string) {
    return xor(base64Decode(str), key);
}

export interface TinyUser {
    username: string;
    playerID: number;
    accountID?: number;
}

export function parseUsers(str: string) {
    const raw = str.split('|');
    const users: TinyUser[] = [];

    for (const i of raw) {
        const user = i.split(':');
        users.push({
            username: user[1],
            playerID: Number(user[0]),
            accountID: parseIntUndefined(user[2]),
        });
    }

    return users;
}

export function generateRandomUUID() {
    const hex = constants.HEX_CHARACTERS;
    return `${rs(8, hex)}-${rs(4, hex)}-4${rs(3, hex)}-${rs(4, hex)}-${rs(10, hex)}`;
}

export function generateLevelsHash(levels: Level[]) {
    let hash = '';

    for (const level of levels) {
        const ID = level.ID.toString();
        if (!level.stars) throw new Error('Invalid level data. Missing stars.');

        hash += ID[0] + ID[ID.length - 1] + level.stars.toString() + Number(level.areCoinsVerified).toString();
    }

    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateMapPacksHash(packs: MapPack[]) {
    let hash = '';
    for (const pack of packs) {
        const id = pack.id.toString();
        hash += id[0] + id[id.length - 1] + pack.stars.toString() + pack.coins.toString();
    }
    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateGauntletsHash(packs: GauntletPack[]) {
    let hash = '';

    for (const pack of packs) {
        hash += pack.ID.toString() + pack.levelIDs.join(',');
    }

    return sha1(hash + constants.SALTS.LEVEL);
}

export function generateDownloadHash2(level: {
    password: string;
    playerID: number;
    stars: number;
    demon: boolean;
    id: number;
    verifiedCoins: boolean;
    featureScore: number;
    dailyNumber?: number;
}) {
    let password = level.password || 0;
    if (password && password != 1 && password != 0) password = Number(password) + 1000000;
    const hash = `${level.playerID},${level.stars},${Number(!!level.demon)},${level.id},${Number(!!level.verifiedCoins)},${level.featureScore},${password},${level.dailyNumber ?? 0}${constants.SALTS.LEVEL}`;
    return sha1(hash);
}

export function generateDownloadHash(levelString: string) {
    if (levelString.length < 41) return sha1(`${levelString}${constants.SALTS.LEVEL}`);
    let hash = `????????????????????????????????????????${constants.SALTS.LEVEL}`;
    const m = Math.floor(levelString.length / 40);
    let i = 40;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i * m] + hash.slice(i + 1);
    }
    return sha1(hash);
}

export function generateUploadSeed2(levelString: string) {
    if (levelString.length < 51) return chk([levelString], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
    let hash = '??????????????????????????????????????????????????';
    const m = Math.floor(levelString.length / 50);
    let i = 50;
    while (i) {
        hash = hash.slice(0, --i) + levelString[i * m] + hash.slice(i + 1);
    }
    return chk([hash], constants.KEYS.LEVEL, constants.SALTS.LEVEL);
}

export function generateUploadListSeed(listLevels: string, accountID: string, seed2: string) {
    if (listLevels.length < 51) return chk([listLevels], seed2, accountID);
    let hash = '??????????????????????????????????????????????????';
    const m = Math.floor(listLevels.length / 50);

    let i = 50;
    while (i) {
        hash = hash.slice(0, --i) + listLevels[i * m] + hash.slice(i + 1);
    }

    return chk([hash], seed2, accountID);
}

export interface MapPack {
    id: number;
    levels?: number[];
    stars: number;
    coins: number;
    name?: string;
    difficulty?: number;
    textColor?: { r: number; g: number; b: number };
    barColor?: { r: number; g: number; b: number };
}

export function parseMapPack(str: string): MapPack {
    const raw = robTopSplit(str, ':');
    const mp: MapPack = {
        id: Number(raw.get('1')),
        levels: raw
            .get('3')
            ?.split(',')
            .map((i) => Number(i)),
        stars: Number(raw.get('4')),
        coins: Number(raw.get('5')),
    };
    if (raw.get('2')) mp.name = raw.get('2');
    if (raw.get('6')) mp.difficulty = Number(raw.get('6'));
    if (raw.get('7')) {
        const txtCol = raw
            .get('7')!
            .split(',')
            .map((c) => Number(c));
        mp.textColor = { r: txtCol[0], g: txtCol[1], b: txtCol[2] };
    }
    if (raw.get('8')) {
        const barCol = raw
            .get('8')!
            .split(',')
            .map((c) => Number(c));
        mp.barColor = { r: barCol[0], g: barCol[1], b: barCol[2] };
    }

    // for (const i of raw.keys()) {
    //     if (!(["1", "2", "3", "4", "5", "6", "7", "8"].includes(i))) {
    //         json[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return mp;
}

interface LevelMetaData {
    description?: string;
    password?: string;
    songIDs?: string[];
    sfxIDs?: string[];
}

export function parseLevel(client: Client, str: string): Level {
    const json: Partial<LevelMetaData> = {};
    const raw = robTopSplit(str, ':'); // "1:22:5:1:10:1000" -> { 1: "22", 5: "1", 10: "1000" } -> { id: 22, version: 1, downloads: 1000 }
    const levelString = raw.get('4');

    if (!raw.get('1')) throw new Error('Parsing error: Level ID is missing.');

    const ID = parseInt(raw.get('1') ?? '');
    const version = parseInt(raw.get('5') ?? '');
    const playerID = parseInt(raw.get('6') ?? '');
    let difficulty = parseInt(raw.get('9') ?? '');
    const completions = parseIntUndefined(raw.get('11') ?? '');
    const officialSong = parseInt(raw.get('12') ?? '');
    const gameVersion = parseInt(raw.get('13') ?? '');
    const likes = parseInt(raw.get('14') ?? '');
    const length = parseInt(raw.get('15') ?? '');
    const stars = parseInt(raw.get('18') ?? '');
    const featureScore = parseInt(raw.get('19') ?? '');
    const copiedFromID = parseInt(raw.get('30') ?? '');
    const customSongID = parseInt(raw.get('35') ?? '');
    const coins = parseInt(raw.get('37') ?? '');
    const starsRequested = parseInt(raw.get('39') ?? '');
    const dailyNumber = parseIntUndefined(raw.get('41') ?? '');
    const epicRating = parseInt(raw.get('42') ?? '');
    const demonDifficulty = parseInt(raw.get('43') ?? '');
    const objects = parseInt(raw.get('45') ?? '');
    const editorTimeSeconds = parseInt(raw.get('46') ?? '');
    const editorTimeCopiesSeconds = parseInt(raw.get('47') ?? '');
    const verificationTimeFrames = parseIntUndefined(raw.get('57'));

    const isDemon = raw.get('17') === '1';
    const isAuto = raw.get('25') === '1';
    const isTwoPlayer = raw.get('31') === '1';
    const areCoinsVerified = raw.get('38') === '1';
    const isLowDetailMode = raw.get('40') === '1';
    const isGauntlet = raw.get('44') === '1';

    //if (!raw.get("26")) throw new Error("Parsing error: Level record string is missing.");
    //if (!raw.get("28")) throw new Error("Parsing error: Level upload date is missing.");
    //if (!raw.get("29")) throw new Error("Parsing error: Level update date is missing.");
    //if (!raw.get("36")) throw new Error("Parsing error: Level extra string is missing.");
    //if (!raw.get("48")) throw new Error("Parsing error: Level settings string is missing");

    const name = raw.get('2');
    if (!name) throw new Error('Parsing error: Level name is missing.');
    const recordString = raw.get('26');
    const uploadDate = raw.get('28');
    const updateDate = raw.get('29');
    const extraString = raw.get('36');
    const settingsString = raw.get('48');

    if (raw.get('3')) {
        json.description = base64Decode(raw.get('3')!).toString();
        // eslint-disable-next-line no-control-regex
        if (/[\x00-\x1f]/.exec(json.description)) {
            json.description = raw.get('3');
        }
    }

    if (Number(raw.get('8')) && difficulty) {
        difficulty /= Number(raw.get('8'));
    }

    if (raw.get('27')) {
        const password = xor(base64Decode(raw.get('27')!).toString(), constants.KEYS.LEVEL_PASSWORD);
        if (password.toString().length != 1) json.password = password.slice(1);
        else json.password = password;
    }

    if (raw.get('52')) {
        json.songIDs = raw.get('52')!.split(',');
    }

    if (raw.get('53')) {
        json.sfxIDs = raw.get('53')!.split(',');
    }

    // Add unknown keys to the metadata
    // for (const i of raw.keys()) {
    //     if (!levelBoolKeys[i] && !levelStringKeys[i] && !levelNumberKeys[i] && !(["3", "4", "8", "27", "52", "53"].includes(i))) {
    //         json[`unk_${i}`] = raw.get(i);
    //     }
    // }

    const level = new Level(client, {
        ID,
        levelString,
        version,
        playerID,
        difficulty,
        completions,
        officialSong,
        gameVersion,
        likes,
        length,
        stars,
        featureScore,
        copiedFromID,
        customSongID,
        coins,
        starsRequested,
        dailyNumber,
        epicRating,
        demonDifficulty,
        objects,
        editorTimeSeconds,
        editorTimeCopiesSeconds,
        verificationTimeFrames,
        isDemon,
        isAuto,
        isTwoPlayer,
        areCoinsVerified,
        isLowDetailMode,
        isGauntlet,
        name,
        recordString,
        uploadDate,
        updateDate,
        extraString,
        settingsString,
    });

    return level;
}

const levelOldNumberKeys = {
    1: 'id',
    5: 'version',
    6: 'playerID',
    9: 'difficulty',
    10: 'downloads',
    11: 'completions',
    12: 'officialSong',
    13: 'gameVersion',
    14: 'likes',
    15: 'length',
    18: 'stars',
    19: 'featureScore',
    30: 'copiedFromID',
    35: 'customSongID',
} as const;
const levelOldStringKeys = {
    2: 'name',
    26: 'recordString',
    27: 'password',
    28: 'uploadDate',
    29: 'updateDate',
    36: 'extraString',
} as const;
const levelOldBoolKeys = {
    17: 'demon',
    25: 'auto',
    31: 'twoPlayer',
} as const;

export interface LevelOldMetaData
    extends Record<(typeof levelOldNumberKeys)[keyof typeof levelOldNumberKeys], number | undefined>,
        Record<(typeof levelOldStringKeys)[keyof typeof levelOldStringKeys], string | undefined>,
        Record<(typeof levelOldBoolKeys)[keyof typeof levelOldBoolKeys], boolean | undefined> {
    description?: string;
    verifiedCoins?: boolean;
    lowDetailMode?: boolean;
    isGauntlet?: boolean;
    songIDs?: string[];
    sfxIDs?: string[];
}

export interface LevelOld {
    metadata: LevelOldMetaData;
    parsedAt: number;
    levelString?: string;
}

export function parseLevelOld(str: string) {
    const level: Partial<LevelOldMetaData> = {};

    const raw = robTopSplit(str, ':');
    const levelString = raw.get('4');
    for (const i of Object.entries(levelOldNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(levelOldStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = raw.get(i[0].toString()) ?? '';
    }
    for (const i of Object.entries(levelOldBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            level[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get('3')) {
        level.description = base64Decode(raw.get('3')!).toString();
        // eslint-disable-next-line no-control-regex
        if (/[\x00-\x1f]/.exec(level.description)) {
            level.description = raw.get('3');
        }
    }
    if (Number(raw.get('8')) && level.difficulty) {
        level.difficulty /= Number(raw.get('8'));
    }

    // for (const i of raw.keys()) {
    //     if (!levelOldBoolKeys[i] && !levelOldStringKeys[i] && !levelOldNumberKeys[i] && !(["3", "4", "8"].includes(i))) {
    //         level[`unk_${i}`] = raw.get(i);
    //     }
    // }

    const date = Date.now();
    const value: {
        metadata: LevelOldMetaData;
        parsedAt: number;
        levelString?: string;
    } = {
        metadata: level as LevelOldMetaData,
        parsedAt: date,
    };
    if (levelString) value.levelString = levelString;
    return value as LevelOld;
}

export function parseUser(str: string, client: Client, sep = ':'): User {
    const raw = robTopSplit(str, sep);

    let demonCounts: User['demonCounts'] = undefined;
    if (raw.has('55')) {
        const dc = raw.get('55')!.split(',');
        demonCounts = {
            classic: {
                easy: Number(dc[0]),
                medium: Number(dc[1]),
                hard: Number(dc[2]),
                insane: Number(dc[3]),
                extreme: Number(dc[4]),
            },
            platformer: {
                easy: Number(dc[5]),
                medium: Number(dc[6]),
                hard: Number(dc[7]),
                insane: Number(dc[8]),
                extreme: Number(dc[9]),
            },
            weekly: Number(dc[10]),
            gauntlet: Number(dc[11]),
        };
    }

    let levelCounts: User['levelCounts'] = undefined;
    if (raw.has('56')) {
        const lc = raw.get('56')!.split(',').map(Number);
        levelCounts = {
            classic: {
                auto: lc[0],
                easy: lc[1],
                normal: lc[2],
                hard: lc[3],
                harder: lc[4],
                insane: lc[5],
            },
            daily: lc[6],
            gauntlet: lc[7],
        };
    }
    if (raw.has('57')) {
        const lcP = raw.get('57')!.split(',').map(Number);
        levelCounts ??= {};
        levelCounts.platformer = {
            auto: lcP[0],
            easy: lcP[1],
            normal: lcP[2],
            hard: lcP[3],
            harder: lcP[4],
            insane: lcP[5],
        };
    }

    console.log(remapKeys(raw, scoresUserKeyMap));
    return new User(
        client,
        parseIntAssert(raw.get('16')), // accountID
        parseIntAssert(raw.get('2')), // playerID
        parseIntAssert(raw.get('9')), // iconID
        parseIntAssert(raw.get('10')), // color1
        parseIntAssert(raw.get('11')), // color2
        parseIntAssert(raw.get('13')), // secretCoins
        parseIntAssert(raw.get('17')), // userCoins
        parseIntAssert(raw.get('3')), // stars
        parseIntAssert(raw.get('52')), // moons
        parseIntAssert(raw.get('46')), // diamonds
        parseIntAssert(raw.get('4')), // demons
        parseIntAssert(raw.get('14')), // iconType
        parseIntAssert(raw.get('15')), // special
        parseIntAssert(raw.get('18')), // messagePermissions
        parseIntAssert(raw.get('19')), // friendPermissions
        parseIntAssert(raw.get('21')), // cube
        parseIntAssert(raw.get('22')), // ship
        parseIntAssert(raw.get('23')), // ball
        parseIntAssert(raw.get('24')), // ufo
        parseIntAssert(raw.get('25')), // wave
        parseIntAssert(raw.get('26')), // robot
        parseIntAssert(raw.get('53')), // swing
        parseIntAssert(raw.get('54')), // jetpack
        parseIntAssert(raw.get('27')), // trail
        parseIntAssert(raw.get('28')), // glow
        parseIntAssert(raw.get('30')), // globalRank
        parseIntAssert(raw.get('31')), // friendState
        parseIntAssert(raw.get('32')), // friendRequestID
        parseIntAssert(raw.get('38')), // messages
        parseIntAssert(raw.get('39')), // friendRequests
        parseIntAssert(raw.get('40')), // newFriends
        parseIntAssert(raw.get('43')), // spider
        parseIntAssert(raw.get('48')), // deathEffect
        parseIntAssert(raw.get('49')), // modLevel
        parseIntAssert(raw.get('50')), // commentHistoryPermissions
        parseIntUndefined(raw.get('7')), // accountHighlight
        parseIntUndefined(raw.get('51')), // color3
        raw.has('35') ? base64Decode(raw.get('35')!) : undefined, // comment
        parseIntUndefined(raw.get('8')), // creatorPoints
        demonCounts,
        levelCounts,
        parseIntUndefined(raw.get('6')), // rank
    );
}

const messageNumberKeys = {
    1: 'id',
    2: 'accountID',
    3: 'playerID',
} as const;
const messageStringKeys = {
    4: 'title',
    5: 'content',
    6: 'username',
    7: 'age',
} as const;
const messageBoolKeys = {
    8: 'read',
    9: 'outgoing',
} as const;

export interface Message
    extends Record<(typeof messageNumberKeys)[keyof typeof messageNumberKeys], number | undefined>,
        Record<(typeof messageStringKeys)[keyof typeof messageStringKeys], string | undefined>,
        Record<(typeof messageBoolKeys)[keyof typeof messageBoolKeys], boolean | undefined> {}

export function parseMessage(str: string): Message {
    const message: Partial<Message> = {};
    const raw = robTopSplit(str, ':');

    for (const i of Object.entries(messageNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(messageStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) ?? '';
    }
    for (const i of Object.entries(messageBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get('4')) message.title = base64Decode(raw.get('4')!);
    if (raw.get('5')) message.content = xor(base64Decode(raw.get('5')!), constants.KEYS.MESSAGES);

    // for (const i of raw.keys()) {
    //     if (!messageBoolKeys[i] && !messageStringKeys[i] && !messageNumberKeys[i]) {
    //         message[`unk_${i}`] = raw.get(i);
    //     }
    // }

    return message as Message;
}

export function tryUnzip(data: Buffer): Buffer {
    let unzipped;
    try {
        unzipped = zlib.inflateSync(data);
    } catch {
        try {
            unzipped = zlib.inflateRawSync(data);
        } catch {
            try {
                unzipped = zlib.gunzipSync(data);
            } catch {
                try {
                    unzipped = zlib.unzipSync(data);
                } catch {
                    return data;
                }
            }
        }
    }
    return unzipped;
}

export function generateLeaderboardSeed(clicks: number, percentage: number, seconds: number, hasPlayed?: number) {
    hasPlayed ??= 1;
    return 1482 * hasPlayed + (clicks + 3991) * (percentage + 8354) + (seconds + 4085) ** 2 - 50028039;
}

export function generatePlatformerLeaderboardSeed(bestTime: number, bestPoints: number) {
    return (
        (((((bestTime + 7890) % 34567) * 601 + ((Math.abs(bestPoints) + 3456) % 78901) * 967 + 94819) % 94433) * 829) %
        77849
    );
}
