import { Base } from '../Base';
import { Client } from '../Client';
import { UserPostManager } from '../managers/UserPostManager';

export class User extends Base {
    public readonly posts = new UserPostManager(this.client);

    public constructor(
        client: Client,
        public readonly accountID: number,
        public readonly playerID: number,
        public readonly iconID: number,
        public readonly color1: number,
        public readonly color2: number,
        public readonly secretCoins: number,
        public readonly userCoins: number,
        public readonly stars: number,
        public readonly moons: number,
        public readonly diamonds: number,
        public readonly demons: number,
        public readonly iconType: number,
        public readonly special: number,
        public readonly messagePermissions: number,
        public readonly friendPermissions: number,
        public readonly cube: number,
        public readonly ship: number,
        public readonly ball: number,
        public readonly ufo: number,
        public readonly wave: number,
        public readonly robot: number,
        public readonly swing: number,
        public readonly jetpack: number,
        public readonly trail: number,
        public readonly glow: number,
        public readonly globalRank: number,
        public readonly friendState: number,
        public readonly friendRequestID: number,
        public readonly messages: number,
        public readonly friendRequests: number,
        public readonly newFriends: number,
        public readonly spider: number,
        public readonly deathEffect: number,
        public readonly modLevel: number,
        public readonly commentHistoryPermissions: number,
        public readonly accountHighlight?: number,
        public readonly color3?: number,
        public readonly comment?: string,
        public readonly creatorPoints?: number,
        public readonly demonCounts?: {
            classic: {
                easy: number;
                medium: number;
                hard: number;
                insane: number;
                extreme: number;
            };
            platformer: {
                easy: number;
                medium: number;
                hard: number;
                insane: number;
                extreme: number;
            };
            weekly: number;
            gauntlet: number;
        },
        public readonly levelCounts?: {
            classic?: {
                auto: number;
                easy: number;
                normal: number;
                hard: number;
                harder: number;
                insane: number;
            };
            daily?: number;
            gauntlet?: number;
            platformer?: {
                auto: number;
                easy: number;
                normal: number;
                hard: number;
                harder: number;
                insane: number;
            };
        },
        public readonly rank?: number,
    ) {
        super(client);
    }

    public toJSON() {
        return {};
    }
}
