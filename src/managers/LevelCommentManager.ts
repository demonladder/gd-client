import CachedManager from './CachedManager.js';
import Client from '../Client.js';
import Level from '../structures/Level.js';
import { LevelClient } from '../server/LevelClient.js';
import Comment from '../structures/Comment.js';

export default class LevelCommentManager extends CachedManager<Comment> {
    public readonly levelClient: LevelClient;

    public constructor(
        client: Client,
        protected readonly level: Level,
    ) {
        super(client);
        this.levelClient = new LevelClient(client);
    }

    public async fetch(commentID: number): Promise<Comment>;
    public async fetch(): Promise<Comment[]>;
    public async fetch(commentID?: number): Promise<Comment[] | Comment> {
        if (commentID !== undefined) {
            const cacheHit = this.cache.get(commentID);
            if (cacheHit) {
                return cacheHit;
            }

            throw new Error('Comment is not cached');
        }

        const commentResult = await this.levelClient.getComments(this.level.ID);
        commentResult.comments.forEach((comment) => this.cache.set(comment.ID, comment));
        return commentResult.comments;
    }
}
