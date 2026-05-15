import { SALTS } from '../constants';
import type { MapPack } from '../types/MapPack';
import { sha1 } from '.';

export function generateMapPacksHash(packs: MapPack[]) {
    let hash = '';
    for (const pack of packs) {
        const id = pack.id.toString();
        hash += id[0] + id[id.length - 1] + pack.stars.toString() + pack.coins.toString();
    }
    return sha1(hash + SALTS.LEVEL);
}
