import { base64Encode, chk } from '../util';
import { Client } from '../Client';
import { PageInfo } from '../interfaces/PageInfo';
import { PaginationOptions } from '../interfaces/PaginationOptions';
import { RequestClient } from './RequestClient';
import { Comment, Post } from '../structures';
import { parsePageInfo } from '../util/parsers';
import { KEYS, SALTS } from '../constants';

export interface CommentResult extends PageInfo {
    comments: Comment[];
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

        return {
            comments,
            ...parsePageInfo(segments[1]),
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
        const { auth, account } = this.requireAuth('upload a profile post');

        return await this.baseRequest('uploadAccountComment', {
            comment: base64Encode(content),
            ...auth,
            cType: 1,
            ...(account.username
                ? {
                      userName: account.username,
                      chk: chk([account.username, base64Encode(content), 0, 0, 1], KEYS.COMMENT, SALTS.COMMENT),
                  }
                : {}),
        });
    }

    public async deleteProfilePost(ID: number, accountID?: number) {
        const { auth } = this.requireAuth('delete a profile post');
        const data = await this.baseRequest('deleteAccountComment', {
            commentID: ID,
            targetAccountID: accountID ?? auth.accountID,
            ...auth,
        });

        if (data == '1') {
            return true;
        }

        return data;
    }

    public async uploadComment(levelID: number, content: string, percent: number) {
        const { auth, account } = this.requireAuth('upload a comment');
        const chkThing = chk(
            [account.username, base64Encode(content), levelID, percent, 0],
            KEYS.COMMENT,
            SALTS.COMMENT,
        );

        return await this.baseRequest('uploadComment', {
            levelID,
            comment: base64Encode(content),
            percent,
            ...auth,
            chk: chkThing,
            userName: account.username,
        });
    }

    public async deleteComment(levelID: number, commentID: number) {
        const { auth } = this.requireAuth('delete a comment');

        const data = await this.baseRequest('deleteComment', {
            levelID,
            commentID,
            ...auth,
        });

        if (data == '1') {
            return true;
        }

        return data;
    }
}
