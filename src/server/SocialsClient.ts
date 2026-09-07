import { Client } from '../Client';
import { User } from '../structures';
import { RequestClient } from './RequestClient';
import { parseMessage, parseUser, type Message } from '../util/parsers';
import { base64Encode, xor } from '../util';
import { KEYS } from '../constants';

export interface GetMessagesResult {
    messages: Message[];
    total: number;
    offset: number;
    pageSize: number;
}

export interface GetFriendRequestsResponse {
    friendRequests: User[];
    total: number;
    offset: number;
    pageSize: number;
}

export class SocialsClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    public async getUserList(type: number) {
        const { auth } = this.requireAuth('get a user list');

        const data = await this.baseRequest('getUserList', {
            ...auth,
            type,
        });

        return data.split('|').map((e) => parseUser(e, this.client));
    }

    public async getMessages(page: number, type: number) {
        const { auth } = this.requireAuth('get messages');

        const data = await this.baseRequest('getMessages', {
            ...auth,
            page,
            getSent: type,
            total: 0,
        });

        const segments = data.split('#');
        const messages = segments[0].split('|').map((m) => parseMessage(m));
        const pages = segments[1].split(':');

        return {
            messages,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        };
    }

    public async readMessage(messageID: number, isSender: boolean) {
        const { auth } = this.requireAuth('read a message');

        const data = await this.baseRequest('readMessage', {
            ...auth,
            messageID,
            isSender: isSender ? 1 : 0,
        });

        return parseMessage(data);
    }

    public async sendMessage(accountID: number, subject: string, body: string) {
        const { auth } = this.requireAuth('send a message');

        const data = await this.baseRequest('sendMessage', {
            ...auth,
            toAccountID: accountID,
            subject: base64Encode(subject),
            body: base64Encode(xor(body, KEYS.MESSAGES)),
        });

        return data;
    }

    public async deleteMessage(id: number, isSender: boolean) {
        const { auth } = this.requireAuth('delete a message');

        const data = await this.baseRequest('deleteMessage', {
            ...auth,
            messageID: id,
            isSender: Number(!!isSender),
        });

        return data;
    }

    public async blockUser(accountID: number) {
        const { auth } = this.requireAuth('block a user');

        const data = await this.baseRequest('blockUser', {
            ...auth,
            targetAccountID: accountID,
        });

        return data;
    }

    public async unblockUser(accountID: number) {
        const { auth } = this.requireAuth('unblock a user');

        const data = await this.baseRequest('unblockUser', {
            ...auth,
            targetAccountID: accountID,
        });

        return data;
    }

    public async deleteFriendRequests(accountIDs: number | number[], isSender: boolean) {
        const { auth } = this.requireAuth('delete friend requests');

        const data = await this.baseRequest('deleteFriendRequests', {
            ...auth,
            targetAccountID: typeof accountIDs == 'number' ? accountIDs : 0,
            ...(Array.isArray(accountIDs) ? { accounts: accountIDs.join(',') } : {}),
            isSender: isSender ? 1 : 0,
        });

        return data;
    }

    public async sendFriendRequest(accountID: number, comment: string) {
        const { auth } = this.requireAuth('send a friend request');

        const data = await this.baseRequest('sendFriendRequest', {
            ...auth,
            toAccountID: accountID,
            comment: base64Encode(comment),
        });

        return data;
    }

    public async getFriendRequests(page: number, type: number) {
        const { auth } = this.requireAuth('get friend requests');

        const data = await this.baseRequest('getFriendRequests', {
            ...auth,
            page,
            getSent: type,
            total: 0,
        });

        const segments = data.split('#');
        const friendRequests = segments[0].split('|').map((m) => parseUser(m, this.client));
        const pages = segments[1].split(':');

        return {
            friendRequests,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        };
    }

    public async readFriendRequest(requestID: number) {
        const { auth } = this.requireAuth('read a friend request');

        const data = await this.baseRequest('readFriendRequest', {
            ...auth,
            requestID,
        });

        return data;
    }

    public async acceptFriendRequest(requestID: number, targetAccountID: number) {
        const { auth } = this.requireAuth('accept a friend request');

        const data = await this.baseRequest('acceptFriendRequest', {
            ...auth,
            requestID,
            targetAccountID,
        });

        return data;
    }

    public async removeFriend(targetAccountID: number) {
        const { auth } = this.requireAuth('remove a friend');

        const data = await this.baseRequest('removeFriend', {
            ...auth,
            targetAccountID,
        });

        return data;
    }
}
