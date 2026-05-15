import type { MapPack } from '../../types/MapPack';
import { robTopSplit } from '..';

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
