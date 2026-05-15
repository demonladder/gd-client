import { Client } from '../Client';
import { Post } from '../structures/Post';
import { CachedManager } from './CachedManager';

export class UserPostManager extends CachedManager<Post> {
    public constructor(client: Client) {
        super(client);
    }
}
