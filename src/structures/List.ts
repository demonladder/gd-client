import Base from '../Base.js';
import Client from '../Client.js';
import ContentType from '../enums/ContentType.js';
import parseIntAssert from '../util/parsers/parseIntAssert.js';
import parseIntUndefined from '../util/parsers/parseIntUndefined.js';
import { robTopSplit } from '../utils.js';

const listKeyMap = {
    ID: '1',
    unk_3: '3',
    version: '5',
    playerID: '6',
    difficulty: '7',
    downloads: '10',
    likes: '14',
    length: '15',
    stars: '18',
    uploadDate: '28',
    updateDate: '29',
    unk_49: '49',
    listReward: '55',
    listRewardRequirement: '56',
    name: '2',
    username: '50',
    levels: '51',
    isFeatured: '19',
} as const;

export default class List extends Base {
    public readonly ID: number;
    public readonly version: number;
    public readonly playerID?: number;
    public readonly difficulty: number;
    public readonly downloads: number;
    public readonly likes: number;
    public readonly length?: number;
    public readonly levelIDs: number[];
    public readonly stars?: number;
    public readonly uploadDate: Date;
    public readonly updateDate?: Date;
    public readonly listReward: number;
    public readonly listRewardRequirement: number;
    public readonly name: string;
    public readonly username: string;
    public readonly isFeatured: boolean;

    public constructor(client: Client, str: string) {
        super(client);

        const data = robTopSplit(str, ':');
        this.ID = parseIntAssert(data.get(listKeyMap.ID));
        this.version = parseIntAssert(data.get(listKeyMap.version));
        this.playerID = parseIntUndefined(data.get(listKeyMap.playerID));
        this.difficulty = parseIntAssert(data.get(listKeyMap.difficulty));
        this.downloads = parseIntAssert(data.get(listKeyMap.downloads));
        this.likes = parseIntAssert(data.get(listKeyMap.likes));
        this.length = parseIntUndefined(data.get(listKeyMap.length));
        this.stars = parseIntUndefined(data.get(listKeyMap.stars));
        this.uploadDate = new Date(parseIntAssert(data.get(listKeyMap.uploadDate)) * 1000);
        this.updateDate = data.has(listKeyMap.updateDate)
            ? new Date(parseIntAssert(data.get(listKeyMap.updateDate)) * 1000)
            : undefined;
        this.listReward = parseIntAssert(data.get(listKeyMap.listReward));
        this.listRewardRequirement = parseIntAssert(data.get(listKeyMap.listRewardRequirement));

        if (!data.has(listKeyMap.name)) throw new Error('Parsing error: List name is missing.');
        if (!data.has(listKeyMap.username)) throw new Error('Parsing error: List username is missing.');
        this.name = data.get(listKeyMap.name)!;
        this.username = data.get(listKeyMap.username)!;
        this.isFeatured = !!data.get(listKeyMap.isFeatured);

        this.levelIDs = data.get(listKeyMap.levels)?.split(',').map(Number) ?? [];
    }

    /**
     * Like the list.
     */
    public async like() {
        await this.client.likeClient.likeItem(this.ID, 0, ContentType.LIST, 1);
    }

    /**
     * Deletes the list.
     */
    public async destroy() {
        await this.client.lists.destroy(this.ID);
    }

    public toJSON() {
        return {
            difficulty: this.difficulty,
            downloads: this.downloads,
            id: this.ID,
            isFeatured: this.isFeatured,
            length: this.length,
            likes: this.likes,
            listReward: this.listReward,
            listRewardRequirement: this.listRewardRequirement,
            name: this.name,
            playerID: this.playerID,
            stars: this.stars,
            updateDate: this.updateDate,
            uploadDate: this.uploadDate,
            username: this.username,
            version: this.version,
        };
    }
}
