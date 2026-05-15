import type { Song } from '../../types/Song';
import { robTopSplit } from '..';

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
