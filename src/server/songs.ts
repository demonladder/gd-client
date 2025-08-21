import { genericRequest, GenericRequestOptions } from './generic.js';
import * as utils from '../utils.js';
import Client from '../Client.js';
import { AxiosRequestConfig } from 'axios';

export function getSongInfo(
    songID: number,
    instance: Client,
    params: GenericRequestOptions = {},
    callback: (song: utils.Song) => void,
    options?: AxiosRequestConfig,
) {
    genericRequest(
        'getSongInfo',
        { songID },
        function (data) {
            if (data == '-1') throw new Error('Song not found');
            const d = utils.parseSongs(data);
            callback(d[songID] || d);
        },
        instance,
        params,
        options,
    );
}

export interface ArtistResult {
    artists: utils.Artist[];
    total: number;
    offset: number;
    pageSize: number;
}

export function getTopArtists(
    page: number,
    instance: Client,
    params: GenericRequestOptions = {},
    callback: (data: ArtistResult) => void,
    options?: AxiosRequestConfig,
) {
    genericRequest(
        'getTopArtists',
        { page },
        function (d) {
            const data = d.split('#');
            const artists = utils.parseArtists(data[0]);
            const pageInfo = data[1].split(':');
            callback({
                artists,
                total: Number(pageInfo[0]),
                offset: Number(pageInfo[1]),
                pageSize: Number(pageInfo[2]),
            });
        },
        instance,
        params,
        options,
    );
}
