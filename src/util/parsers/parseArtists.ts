import type { Artist } from '../../types/Artist';
import { robTopSplit } from '..';

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
