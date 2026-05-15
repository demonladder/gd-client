import { Client } from '../Client';
import { RequestClient } from './RequestClient';
import { ContentType } from '../enums';
import { chk, generateRandomString } from '../util';
import { KEYS, SALTS } from '../constants';

export class LikeClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async likeItem(itemID: number, special: number, type: ContentType, like: 0 | 1) {
        if (!this.client.auth || !this.client.account)
            throw new Error('You must authenticate in order to like/dislike items');

        const randomString = generateRandomString(10);
        const chkThing = chk(
            [
                special,
                itemID,
                like,
                type,
                randomString,
                this.client.auth.accountID,
                this.client.account.udid,
                this.client.account.playerID,
            ],
            KEYS.RATE,
            SALTS.LIKE_OR_RATE,
        );

        const data = await this.baseRequest('likeItem', {
            itemID,
            special,
            type,
            like,
            chk: chkThing,
            rs: randomString,
            udid: this.client.account.udid,
            uuid: this.client.account.playerID,
            ...this.client.auth,
        });

        return data;
    }
}
