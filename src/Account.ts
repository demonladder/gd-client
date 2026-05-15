import { Base } from './Base';
import { Client } from './Client';

export class Account extends Base {
    public constructor(
        client: Client,
        public readonly playerID: number,
        public readonly accountID: number,
        public readonly password: string,
        public readonly username: string,
        public readonly udid: string,
    ) {
        super(client);
    }

    public toJSON() {
        return {
            playerID: this.playerID,
            accountID: this.accountID,
            username: this.username,
            udid: this.udid,
        };
    }
}
