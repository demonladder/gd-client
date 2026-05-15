import type { Client } from '../../Client';
import { KEYS } from '../../constants';
import { Level } from '../../structures/Level';
import { base64Decode, robTopSplit, xor } from '..';
import { parseIntUndefined } from '.';

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
        const password = xor(base64Decode(raw.get('27')!).toString(), KEYS.LEVEL_PASSWORD);
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
