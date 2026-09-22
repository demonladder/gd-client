import type { Client } from '../../Client';
import { KEYS } from '../../constants';
import { Level } from '../../structures';
import { base64Decode, robTopSplit, xor } from '..';
import { LevelLength } from '../../enums';

function parseLevelLength(length: number) {
    // prettier-ignore
    switch (length) {
        default:
        case 0: return LevelLength.TINY;
        case 1: return LevelLength.SHORT;
        case 2: return LevelLength.MEDIUM;
        case 3: return LevelLength.LONG;
        case 4: return LevelLength.XL;
        case 5: return LevelLength.PLATFORMER;
    }
}

export function parseLevel(client: Client, str: string): Level {
    const raw = robTopSplit(str, ':');
    const levelString = raw.get('4');

    const ID = raw.getIntOrThrow('1', 'Parsing error: Level ID is missing');
    const name = raw.getOrThrow('2', 'Parsing error: Level name is missing.');
    const version = raw.getInt('5');
    const playerID = raw.getInt('6');
    let difficulty = raw.getInt('9');
    const downloads = raw.getIntOrThrow('10');
    const completions = raw.getInt('11');
    const officialSong = raw.getIntOrThrow('12');
    const likes = raw.getIntOrThrow('14');
    const length = parseLevelLength(raw.getIntOrThrow('15'));
    const isDemon = raw.getBool('17');
    const stars = raw.getInt('18');
    const featureScore = raw.getIntOrThrow('19');
    const isAuto = raw.getBool('25');
    const recordString = raw.get('26');
    const copiedFromID = raw.getInt('30');
    const isTwoPlayer = raw.getBool('31');
    const customSongID = raw.getInt('35');
    const extraString = raw.get('36');
    const coins = raw.getIntOrThrow('37');
    const areCoinsVerified = raw.getBool('38');
    const starsRequested = raw.getIntOrThrow('39');
    const isLowDetailMode = raw.getBool('40');
    const dailyNumber = raw.getInt('41');
    const epicRating = raw.getIntOrThrow('42');
    const demonDifficulty = raw.getIntOrThrow('43');
    const isGauntlet = raw.getBool('44');
    const objects = raw.getInt('45');

    const editorTimeSeconds = raw.getInt('46');
    const editorTimeCopiesSeconds = raw.getInt('47');
    const settingsString = raw.get('48');
    const verificationTimeFrames = raw.getInt('57');

    const uploadedAt = new Date(raw.getIntOrThrow('62') * 1000).toISOString();
    const updatedAt = new Date(raw.getIntOrThrow('63') * 1000).toISOString();

    let description: string | undefined;
    if (raw.has('3')) {
        description = base64Decode(raw.get('3')!).toString();
        // eslint-disable-next-line no-control-regex
        if (/[\x00-\x1f]/.test(description)) {
            description = raw.get('3')!;
        }
    }

    if (raw.getInt('8') !== undefined && difficulty) {
        difficulty /= raw.getIntOrThrow('8');
    }

    let password: string | undefined = undefined;
    if (raw.has('27')) {
        const p = xor(base64Decode(raw.get('27')!).toString(), KEYS.LEVEL_PASSWORD);
        if (p.toString().length != 1) password = p.slice(1);
        else password = p;
    }

    const songIds: number[] =
        raw
            .get('52')
            ?.split(',')
            .map((id) => parseInt(id)) ?? [];

    const sfxIds: number[] =
        raw
            .get('53')
            ?.split(',')
            .map((id) => parseInt(id)) ?? [];

    const level = new Level(client, {
        ID,
        description,
        password,
        levelString,
        version,
        playerID,
        difficulty,
        completions,
        officialSong: officialSong !== 0 ? officialSong : undefined,
        gameVersion: raw.getIntOrThrow('13'),
        likes,
        length,
        downloads,
        stars: stars !== 0 ? stars : undefined,
        featureScore,
        copiedFromID: copiedFromID !== 0 ? copiedFromID : undefined,
        customSongID: customSongID !== 0 ? customSongID : undefined,
        coins,
        starsRequested,
        dailyNumber,
        epicRating,
        demonDifficulty,
        objects: objects !== 0 ? objects : undefined,
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
        uploadDate: uploadedAt,
        updateDate: updatedAt,
        extraString,
        settingsString,
        songIds,
        sfxIds,
    });

    return level;
}
