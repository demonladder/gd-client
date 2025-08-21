import Base from '../Base.js';
import Client from '../Client.js';

export default abstract class CachedManager<T extends Base> extends Base {
    public readonly cache = new Map<number, T>();

    public constructor(client: Client) {
        super(client);
    }

    public toJSON() {
        return [...this.cache.values()].map((value) => value.toJSON());
    }
}
