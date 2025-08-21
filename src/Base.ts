import Client from './Client.js';

export default abstract class Base {
    public constructor(public readonly client: Client) {}

    public abstract toJSON(): object;
}
