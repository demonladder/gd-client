import { Client } from '../Client';
import { ListSearchType } from '../enums';
import { UploadListOptions, ListClient } from '../server/ListClient';
import { List } from '../structures/List';
import { CachedManager } from './CachedManager';

export interface ListFetchOptions {
    query?: string;
    count?: number;
    page?: number;
    difficulty?: number;
    rated?: boolean;
}

export class ListManager extends CachedManager<List> {
    private readonly listClient = new ListClient(this.client);

    public constructor(client: Client) {
        super(client);
    }

    public async fetch(query: string): Promise<List[]>;
    public async fetch(listID: number): Promise<List>;
    public async fetch(listID: string | number, force = false): Promise<List | List[]> {
        if (typeof listID === 'string') {
            return this._cacheAndReturn(
                await this.listClient.getLists({
                    query: listID,
                    type: ListSearchType.SEARCH,
                }),
            );
        }

        if (!force) {
            const cacheHit = this.cache.get(listID);
            if (cacheHit) return cacheHit;
        }

        const lists = await this.listClient.getLists({
            query: listID.toString(),
            type: ListSearchType.SEARCH,
        });
        if (lists.length === 0) throw new Error('List not found');

        lists.forEach((list) => this.cache.set(list.ID, list));
        return this.cache.get(listID)!;
    }

    private _cacheAndReturn(lists: List[]): List[] {
        lists.forEach((list) => this.cache.set(list.ID, list));
        return lists;
    }

    public async fetchMostDownloaded(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.MOST_DOWNLOADS,
            }),
        );
    }

    public async fetchMostLiked(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.MOST_LIKES,
            }),
        );
    }

    public async fetchTrending(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.TRENDING,
            }),
        );
    }

    public async fetchRecent(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.RECENT,
            }),
        );
    }

    public async fetchByAccountID(accountID: number, options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                accountID,
                type: ListSearchType.BY_ACCOUNT_ID,
            }),
        );
    }

    public async fetchTop(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.TOP,
            }),
        );
    }

    public async fetchMagic(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.MAGIC,
            }),
        );
    }

    public async fetchAwarded(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.AWARDED,
            }),
        );
    }

    public async fetchByAccoundIDs(accountIDs: number[], options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                accountIDs,
                type: ListSearchType.MOST_LIKES,
            }),
        );
    }

    public async fetchFriends(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.FRIENDS,
            }),
        );
    }

    public async fetchSent(options: ListFetchOptions = {}): Promise<List[]> {
        return this._cacheAndReturn(
            await this.listClient.getLists({
                ...options,
                type: ListSearchType.SENT,
            }),
        );
    }

    public async upload(options: UploadListOptions) {
        return await this.listClient.uploadList(options);
    }

    public async destroy(listID: number) {
        await this.listClient.deleteList(listID);
    }
}
