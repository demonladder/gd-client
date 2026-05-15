import { Base } from '../Base';
import { Client } from '../Client';
import { ContentType } from '../enums';
import { base64Decode, robTopSplit } from '../util';
import { parseIntAssert, parseIntUndefined } from '../util/parsers';

const userCommentKeyMap = {
    levelID: '1',
    content: '2',
    playerID: '3',
    likes: '4',
    spam: '5', // Optional
    ID: '6',
    age: '9',
    percent: '10',
    modBadge: '11', // Optional
    textColor: '12', // Optional
} as const;

export class Comment extends Base {
    public readonly ID: number;
    public readonly levelID: number;
    public readonly playerID: number;
    public readonly likes: number;
    public readonly percent: number;
    public readonly content: string;
    public readonly age?: string;
    public readonly isSpam: boolean;
    public readonly modBadge?: number;
    public readonly textColor?: { r: number; g: number; b: number };

    public constructor(client: Client, str: string) {
        super(client);

        const data = robTopSplit(str, '~');

        this.levelID = parseIntAssert(data.get(userCommentKeyMap.levelID));
        if (!data.has(userCommentKeyMap.content)) throw new Error('Parsing error: Comment content is missing.');
        this.content = base64Decode(data.get(userCommentKeyMap.content)!);
        this.playerID = parseIntAssert(data.get(userCommentKeyMap.playerID));
        this.likes = parseIntAssert(data.get(userCommentKeyMap.likes));
        this.ID = parseIntAssert(data.get(userCommentKeyMap.ID));
        this.percent = parseIntAssert(data.get(userCommentKeyMap.percent));

        this.age = data.get(userCommentKeyMap.age);
        this.isSpam = data.get(userCommentKeyMap.spam) === '1';
        this.modBadge = parseIntUndefined(data.get(userCommentKeyMap.modBadge));
        if (data.has(userCommentKeyMap.textColor)) {
            const [r, g, b] = data.get(userCommentKeyMap.textColor)!.split(',').map(Number);
            this.textColor = { r, g, b };
        }
    }

    /**
     * Like the comment.
     */
    public async like() {
        await this.client.likeClient.likeItem(this.ID, 0, ContentType.COMMENT, 1);
    }

    /**
     * Deletes this comment.
     */
    public async destroy() {
        await this.client.comments.deleteComment(this.levelID, this.ID);
    }

    public toJSON() {
        return {
            playerID: this.playerID,
            ID: this.ID,
            likes: this.likes,
            percent: this.percent,
            content: this.content,
            levelID: this.levelID,
            modBadge: this.modBadge,
            age: this.age,
            textColor: this.textColor,
        };
    }
}
