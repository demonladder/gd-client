import * as constants from '../constants.js';
import * as utils from '../utils.js';
import Client from '../Client.js';
import List from '../structures/List.js';
import RequestClient from './RequestClient.js';
import ListSearchType from '../enums/ListSearchType.js';

export interface GetListsOptions {
    query?: string;
    type?: ListSearchType;
    count?: number;
    page?: number;
    difficulty?: number;
    accountID?: number;
    accountIDs?: number[];
    rated?: boolean;
}

export interface UploadListOptions {
    ID?: number;
    name: string;
    description?: string;
    levels: string[];
    difficulty?: number;
    originalID?: number;
    unlistedMode?: number;
    version?: number;
}

/**
 * This client interacts with lists through the GD API.
 */
export default class ListClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async getLists(options: GetListsOptions) {
        const diffMap: Record<string, number> = {
            '-1': -3,
            0: -1,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: -2,
            7: -2,
            8: -2,
            9: -2,
            10: -2,
        };

        const diff: {
            difficulty?: number;
            demonFilter?: number;
        } = {};
        if (options.difficulty) {
            diff.difficulty = diffMap[options.difficulty];
            if (options.difficulty > 5) {
                diff.demonFilter = options.difficulty - 5;
            }
        }

        let str = options.query ?? '';
        if (options.type === ListSearchType.BY_ACCOUNT_ID) {
            if (options.accountID === undefined)
                throw new Error('Account ID must be provided when searching by account ID');
            str = options.accountID.toString();
        }

        if (options.type === ListSearchType.FRIENDS) {
            if (!this.client.auth) throw new Error('Must be authorized to get friend levels');
        }

        const parsedOpts = {
            str,
            star: options.rated ? 1 : 0,
            count: options.count ?? 10,
            page: options.page ?? 0,
            type: options.type ?? 2,
            followed: options.accountIDs ? options.accountIDs.join(',') : '',
            ...diff,
            ...(options.type === ListSearchType.FRIENDS ? this.client.auth : {}),
        };

        const data = await this.baseRequest('getLists', parsedOpts);
        const segments = data.split('#');
        return segments[0].split('|').map((e) => new List(this.client, e));
    }

    public async uploadList(options: UploadListOptions) {
        if (!this.client.auth) throw new Error('Account not logged in');

        const seed2 = utils.rs(5);

        const data = await this.baseRequest('uploadList', {
            listID: options.ID ?? 0,
            listName: options.name,
            listDesc: options.description ? utils.base64Encode(options.description) : '',
            listLevels: options.levels.join(','),
            difficulty: options.difficulty ?? -1,
            original: options.originalID ?? 0,
            unlisted: options.unlistedMode ?? 0,
            listVersion: options.version ?? 0,
            seed: utils.generateUploadListSeed(options.levels.join(','), this.client.auth.accountID.toString(), seed2),
            seed2,
            ...this.client.auth,
        });

        if (Number(data) < 0) {
            switch (data) {
                case '-4':
                    throw new Error('invalid name');
                case '-5':
                    throw new Error('missing name');
                case '-6':
                    throw new Error('invalid level list');
                case '-9':
                    throw new Error('invalid account ID');
                case '-10':
                    throw new Error('invalid seed');
                case '-11':
                    throw new Error('incorrect password');
                case '-12':
                    throw new Error('ratelimited');
                case '-100':
                    throw new Error('incorrect secret');
                default:
                    throw new Error(data);
            }
        }

        return data;
    }

    public async deleteList(ID: number) {
        if (!this.client.auth) throw new Error('Account not logged in');

        return await this.baseRequest(
            'deleteList',
            {
                listID: ID,
                ...this.client.auth,
            },
            {
                secret: constants.SECRETS.DELETE,
            },
        );
    }
}
