import { SALTS } from '../constants';
import type { GauntletPack } from '../server/LevelClient';
import { sha1 } from '.';

export function generateGauntletsHash(packs: GauntletPack[]) {
    let hash = '';

    for (const pack of packs) {
        hash += pack.ID.toString() + pack.levelIDs.join(',');
    }

    return sha1(hash + SALTS.LEVEL);
}
