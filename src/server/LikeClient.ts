import * as constants from '../constants.js';
import * as utils from '../utils.js';
import Client from '../Client.js';
import RequestClient from './RequestClient.js';
import ContentType from '../enums/ContentType.js';

export default class LikeClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async likeItem(itemID: number, special: number, type: ContentType, like: 0 | 1) {
        if (!this.client.auth || !this.client.account)
            throw new Error('You must authenticate in order to like/dislike items');

        const rs = utils.rs(10);
        const chk = utils.chk(
            [
                special,
                itemID,
                like,
                type,
                rs,
                this.client.auth.accountID,
                this.client.account.udid,
                this.client.account.playerID,
            ],
            constants.KEYS.RATE,
            constants.SALTS.LIKE_OR_RATE,
        );

        const data = await this.baseRequest('likeItem', {
            itemID,
            special,
            type,
            like,
            chk,
            rs,
            udid: this.client.account.udid,
            uuid: this.client.account.playerID,
            ...this.client.auth,
        });

        return data;
    }
}
