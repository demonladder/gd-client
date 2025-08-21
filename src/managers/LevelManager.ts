import Client from '../Client.js';
import { LevelClient } from '../server/LevelClient.js';
import LevelSearchType from '../enums/LevelSearchType.js';
import Level from '../structures/Level.js';
import { GDAPIError } from '../server/generic.js';
import CachedManager from './CachedManager.js';

interface FetchLevelOptions {
    count?: number;
    fetchType?: LevelSearchType;
}

export default class LevelManager extends CachedManager<Level> {
    public readonly levelClient: LevelClient;

    public constructor(client: Client) {
        super(client);

        this.levelClient = new LevelClient(client);
    }

    public async fetch(options?: number): Promise<Level>;
    public async fetch(options?: FetchLevelOptions): Promise<Level[]>;
    public async fetch(options?: FetchLevelOptions | number): Promise<Level[] | Level> {
        if (typeof options === 'number') {
            try {
                const cacheHit = this.cache.get(options);
                if (cacheHit) {
                    return cacheHit;
                }

                const result = await this.levelClient.getLevels({
                    query: options.toString(),
                    type: LevelSearchType.BY_ID,
                });

                this.cache.set(result.levels[0].ID, result.levels[0]);
                return result.levels[0];
            } catch (err) {
                if (err instanceof GDAPIError) {
                    if (err.code === -1) throw new Error('Level not found');
                }

                throw err;
            }
        }

        const result = await this.levelClient.getLevels({
            type: options?.fetchType,
            count: options?.count,
        });

        for (const level of result.levels) {
            this.cache.set(level.ID, level);
        }

        return result.levels;
    }

    public async delete(levelID: number) {
        await this.levelClient.delete(levelID);
        this.cache.delete(levelID);
    }
}
