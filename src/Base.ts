import { Client } from './Client';

export abstract class Base {
    public constructor(
        /**
         * Reference to the client that made this object.
         */
        public readonly client: Client,
    ) {}

    public abstract toJSON(): object;
}
