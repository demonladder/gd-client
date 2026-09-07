import { Client } from '../Client';
import { LevelClient } from '../server/LevelClient';
import { LevelSearchType } from '../enums';
import { Level } from '../structures';
import { GdApiError } from '../types/gdApiError';
import { CachedManager } from './CachedManager';

interface FetchLevelOptions {
    count?: number;
    fetchType?: LevelSearchType;
}

export class LevelManager extends CachedManager<Level> {
    public readonly levelClient: LevelClient;

    public constructor(client: Client) {
        super(client);

        this.levelClient = new LevelClient(client);
    }

    public async fetch(levelId?: number): Promise<Level>;
    public async fetch(options?: FetchLevelOptions): Promise<Level[]>;
    public async fetch(options?: FetchLevelOptions | number): Promise<Level[] | Level> {
        if (typeof options === 'number') {
            try {
                const cacheHit = this.cache.get(options);
                if (cacheHit) {
                    return cacheHit;
                }

                const result = await this.levelClient.download(options);

                this.cache.set(result.level.ID, result.level);
                return result.level;
            } catch (err) {
                if (err instanceof GdApiError) {
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
