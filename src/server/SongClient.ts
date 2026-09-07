import { Client } from '../Client';
import { RequestClient } from './RequestClient';
import { GdApiError } from '../types/gdApiError';
import { type Artist } from '../types/Artist';
import { type Song } from '../types/Song';
import { parseArtists, parseSongs } from '../util/parsers';

export interface ArtistResult {
    artists: Artist[];
    total: number;
    offset: number;
    pageSize: number;
}

export class SongClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    /**
     * @throws {Error} Throws if no song with the given ID exists.
     * @param songID
     * @returns
     */
    public async getSongInfo(songID: number): Promise<Song> {
        let data: string;

        try {
            data = await this.baseRequest('getSongInfo', { songID });
        } catch (err) {
            if (err instanceof GdApiError && err.code === -1) throw new Error('Song not found');

            throw err;
        }

        const song = parseSongs(data)[songID];
        if (!song) throw new Error('Song not found');

        return song;
    }

    public async getTopArtists(page: number): Promise<ArtistResult> {
        const segments = (await this.baseRequest('getTopArtists', { page })).split('#');

        const artists = parseArtists(segments[0]);
        const pageInfo = segments[1].split(':');

        return {
            artists,
            total: Number(pageInfo[0]),
            offset: Number(pageInfo[1]),
            pageSize: Number(pageInfo[2]),
        };
    }
}
