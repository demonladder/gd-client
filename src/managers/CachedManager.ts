import { Base } from '../Base';
import { Client } from '../Client';

export abstract class CachedManager<T extends Base> extends Base {
    public readonly cache = new Map<number, T>();

    public constructor(client: Client) {
        super(client);
    }

    public toJSON() {
        return [...this.cache.values()].map((value) => value.toJSON());
    }
}
