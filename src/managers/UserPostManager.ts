import Client from '../Client.js';
import Post from '../structures/Post.js';
import CachedManager from './CachedManager.js';

export default class UserPostManager extends CachedManager<Post> {
    public constructor(client: Client) {
        super(client);
    }
}
