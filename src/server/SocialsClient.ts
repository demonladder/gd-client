import { Client } from '../Client';
import { User } from '../structures/User';
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
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('getUserList', {
            ...this.client.auth,
            type,
        });

        return data.split('|').map((e) => parseUser(e, this.client));
    }

    public async getMessages(page: number, type: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('getMessages', {
            ...this.client.auth,
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
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('readMessage', {
            ...this.client.auth,
            messageID,
            isSender: isSender ? 1 : 0,
        });

        return parseMessage(data);
    }

    public async sendMessage(accountID: number, subject: string, body: string) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('sendMessage', {
            ...this.client.auth,
            toAccountID: accountID,
            subject: base64Encode(subject),
            body: base64Encode(xor(body, KEYS.MESSAGES)),
        });

        return data;
    }

    public async deleteMessage(id: number, isSender: boolean) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('deleteMessage', {
            ...this.client.auth,
            messageID: id,
            isSender: Number(!!isSender),
        });

        return data;
    }

    public async blockUser(accountID: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('blockUser', {
            ...this.client.auth,
            targetAccountID: accountID,
        });

        return data;
    }

    public async unblockUser(accountID: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('unblockUser', {
            ...this.client.auth,
            targetAccountID: accountID,
        });

        return data;
    }

    public async deleteFriendRequests(accountIDs: number | number[], isSender: boolean) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('deleteFriendRequests', {
            ...this.client.auth,
            targetAccountID: typeof accountIDs == 'number' ? accountIDs : 0,
            ...(Array.isArray(accountIDs) ? { accounts: accountIDs.join(',') } : {}),
            isSender: isSender ? 1 : 0,
        });

        return data;
    }

    public async sendFriendRequest(accountID: number, comment: string) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('sendFriendRequest', {
            ...this.client.auth,
            toAccountID: accountID,
            comment: base64Encode(comment),
        });

        return data;
    }

    public async getFriendRequests(page: number, type: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('getFriendRequests', {
            ...this.client.auth,
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
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('readFriendRequest', {
            ...this.client.auth,
            requestID,
        });

        return data;
    }

    public async acceptFriendRequest(requestID: number, targetAccountID: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('acceptFriendRequest', {
            ...this.client.auth,
            requestID,
            targetAccountID,
        });

        return data;
    }

    public async removeFriend(targetAccountID: number) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const data = await this.baseRequest('removeFriend', {
            ...this.client.auth,
            targetAccountID,
        });

        return data;
    }
}
