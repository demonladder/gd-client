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
        const { auth, account } = this.requireAuth('like or dislike items');

        const randomString = generateRandomString(10);
        const chkThing = chk(
            [special, itemID, like, type, randomString, auth.accountID, account.udid, account.playerID],
            KEYS.RATE,
            SALTS.LIKE_OR_RATE,
        );

        return await this.baseRequest('likeItem', {
            itemID,
            special,
            type,
            like,
            chk: chkThing,
            rs: randomString,
            udid: account.udid,
            uuid: account.playerID,
            ...auth,
        });
    }
}
