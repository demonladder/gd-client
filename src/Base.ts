import { Client } from './Client';

export abstract class Base {
    public constructor(public readonly client: Client) {}

    public abstract toJSON(): object;
}
