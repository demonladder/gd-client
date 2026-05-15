import { Base } from '../Base';
import { Client } from '../Client';

export class LeaderboardRecord extends Base {
    public constructor(
        client: Client,
        public readonly name: string,
        public readonly playerID: number,
        public readonly accountID: number,
        public readonly iconID: number,
        public readonly color1: number,
        public readonly color2: number,
        public readonly iconType: number,
        public readonly special: number,
        public readonly percent: number,
        public readonly coins: number,
        public readonly rank: number,
        public readonly age: string,
    ) {
        super(client);
    }

    public toJSON() {
        return {
            name: this.name,
            playerID: this.playerID,
            accountID: this.accountID,
            iconID: this.iconID,
            color1: this.color1,
            color2: this.color2,
            iconType: this.iconType,
            special: this.special,
            percent: this.percent,
            coins: this.coins,
            rank: this.rank,
            age: this.age,
        };
    }
}
