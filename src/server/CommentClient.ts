import { base64Encode, chk, gjp2 } from '../util';
import { Client } from '../Client';
import { PaginationOptions } from '../interfaces/PaginationOptions';
import { RequestClient } from './RequestClient';
import { Comment } from '../structures/Comment';
import { Post } from '../structures/Post';
import { KEYS, SALTS } from '../constants';

export interface CommentResult {
    comments: Comment[];
    total: number;
    offset: number;
    pageSize: number;
}

export enum CommentMode {
    RECENT = 0,
    TOP = 1,
}

interface CommentOptions extends PaginationOptions {
    /**
     * Defaults to {@link CommentMode.RECENT}
     */
    mode?: CommentMode;
}

export class CommentClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async getCommentHistory(playerID: number, options: CommentOptions = {}) {
        const data = await this.baseRequest('getCommentHistory', {
            userID: playerID,
            ...options,
        });
        const segments = data.split('#');
        const comments = segments[0].split('|').map((u) => new Comment(this.client, u.split(':')[0]));
        const pages = segments[1].split(':');

        return {
            comments,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        };
    }

    public async getProfilePosts(accountID: number, options: CommentOptions = {}) {
        const data = await this.baseRequest('getAccountComments', {
            accountID,
            ...options,
        });
        return data.split('|').map((str) => new Post(this.client, str));
    }

    public async uploadProfilePost(content: string) {
        if (!this.client.account) throw new Error('You must authenticate in order to do this');

        return await this.baseRequest('uploadAccountComment', {
            comment: base64Encode(content),
            ...this.client.auth,
            cType: 1,
            ...(this.client.account.username
                ? {
                      userName: this.client.account.username,
                      chk: chk(
                          [this.client.account.username, base64Encode(content), 0, 0, 1],
                          KEYS.COMMENT,
                          SALTS.COMMENT,
                      ),
                  }
                : {}),
        });
    }

    public async deleteProfilePost(ID: number, accountID?: number) {
        if (!this.client.account) throw new Error('You must authenticate in order to do this');
        const data = await this.baseRequest('deleteAccountComment', {
            commentID: ID,
            targetAccountID: accountID ?? this.client.account.accountID,
            accountID: this.client.account.accountID,
            gjp2: gjp2(this.client.account.password),
        });

        if (data == '1') {
            return true;
        }

        return data;
    }

    public async uploadComment(levelID: number, content: string, percent: number) {
        if (!this.client.account) throw new Error('You must authenticate in order to do this');
        const chkThing = chk(
            [this.client.account.username, base64Encode(content), levelID, percent, 0],
            KEYS.COMMENT,
            SALTS.COMMENT,
        );

        return await this.baseRequest('uploadComment', {
            levelID,
            comment: base64Encode(content),
            percent,
            gjp2: gjp2(this.client.account.password),
            accountID: this.client.account.accountID,
            chk: chkThing,
            userName: this.client.account.username,
        });
    }

    public async deleteComment(levelID: number, commentID: number) {
        if (!this.client.auth) throw new Error('You must authenticate in order to do this');

        const data = await this.baseRequest('deleteComment', {
            levelID,
            commentID,
            ...this.client.auth,
        });

        if (data == '1') {
            return true;
        }

        return data;
    }
}
