import * as constants from '../constants.js';
import * as utils from '../utils.js';
import Client from '../Client.js';
import { PaginationOptions } from '../interfaces/PaginationOptions.js';
import RequestClient from './RequestClient.js';
import Comment from '../structures/Comment.js';
import Post from '../structures/Post.js';

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

export default class CommentClient extends RequestClient {
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
            comment: utils.base64Encode(content),
            ...this.client.auth,
            cType: 1,
            ...(this.client.account.username
                ? {
                      userName: this.client.account.username,
                      chk: utils.chk(
                          [this.client.account.username, utils.base64Encode(content), 0, 0, 1],
                          constants.KEYS.COMMENT,
                          constants.SALTS.COMMENT,
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
            gjp2: utils.gjp2(this.client.account.password),
        });

        if (data == '1') {
            return true;
        }

        return data;
    }

    public async uploadComment(levelID: number, content: string, percent: number) {
        if (!this.client.account) throw new Error('You must authenticate in order to do this');
        const chk = utils.chk(
            [this.client.account.username, utils.base64Encode(content), levelID, percent, 0],
            constants.KEYS.COMMENT,
            constants.SALTS.COMMENT,
        );

        return await this.baseRequest('uploadComment', {
            levelID,
            comment: utils.base64Encode(content),
            percent,
            gjp2: utils.gjp2(this.client.account.password),
            accountID: this.client.account.accountID,
            chk,
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
