import { Client } from '../Client';
import { RequestClient } from './RequestClient';
import { base64Decode, base64Encode, generateRandomString, getRandomNumber, gjp2, sha1, xor } from '../util';
import { KEYS, SALTS } from '../constants';

export interface GetRewardResult {
    randomString1: string;
    randomString2: string;
    playerID: number;
    chkNumber: number;
    udid: string;
    accountID: number;
    smallChestCooldown: number;
    smallChest: {
        orbs: number;
        diamonds: number;
        item1: number;
        item2: number;
    };
    claimedSmallChests: number;
    largeChestCooldown: number;
    largeChest: {
        orbs: number;
        diamonds: number;
        item1: number;
        item2: number;
    };
    claimedLargeChests: number;
    rewardType: number;
    hash: string;
    isHashValid: boolean;
}

export interface GetChallengesResult {
    randomString1: string;
    randomString2: string;
    playerID: number;
    chkNumber: number;
    udid: string;
    accountID: number;
    newQuestsCooldown: number;
    quests: {
        unknown: string;
        type: number;
        amount: number;
        reward: number;
        name: string;
    }[];
    hash: string;
    isHashValid: boolean;
}

/**
 * Builds the `chk` parameter both reward endpoints expect: five random characters
 * followed by an XOR-ed and base64 encoded random number.
 */
function generateRewardChk(key: string) {
    return `${generateRandomString(5)}${base64Encode(xor(getRandomNumber(10000, 1000000).toString(), key))}`;
}

/**
 * Both reward endpoints answer with the same envelope: five leading random characters,
 * the XOR-ed and base64 encoded payload, then a `|` and the hash of that payload.
 */
function decodeRewardResponse(data: string, key: string, salt: string) {
    const segments = data.split('|');
    const infoRaw = segments[0].slice(5);
    const hash = segments[1];

    return {
        startString: segments[0].slice(0, 5),
        info: xor(base64Decode(infoRaw), key).split(':'),
        hash,
        isHashValid: sha1(infoRaw + salt) == hash,
    };
}

export class RewardClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    /**
     * @throws If the client is not logged in.
     * @param type
     * @returns
     */
    public async getRewards(type: number): Promise<GetRewardResult> {
        const account = this.client.account;
        if (!account) throw new Error('Account not logged in');

        const data = await this.baseRequest('getRewards', {
            chk: generateRewardChk(KEYS.CHEST_REWARDS),
            rewardType: type,
            r1: getRandomNumber(100, 99999),
            r2: getRandomNumber(100, 99999),
            udid: account.udid,
            accountID: account.accountID,
            gjp2: gjp2(account.password),
        });

        const { startString, info, hash, isHashValid } = decodeRewardResponse(data, KEYS.CHEST_REWARDS, SALTS.REWARDS);
        const small = info[6].split(',');
        const big = info[9].split(',');

        return {
            randomString1: startString,
            randomString2: info[0],
            playerID: Number(info[1]),
            chkNumber: Number(info[2]),
            udid: info[3],
            accountID: Number(info[4]),
            smallChestCooldown: Number(info[5]),
            smallChest: {
                orbs: Number(small[0]),
                diamonds: Number(small[1]),
                item1: Number(small[2]),
                item2: Number(small[3]),
            },
            claimedSmallChests: Number(info[7]),
            largeChestCooldown: Number(info[8]),
            largeChest: {
                orbs: Number(big[0]),
                diamonds: Number(big[1]),
                item1: Number(big[2]),
                item2: Number(big[3]),
            },
            claimedLargeChests: Number(info[10]),
            rewardType: Number(info[11]),
            hash,
            isHashValid,
        };
    }

    /**
     * @throws If the client is not logged in.
     * @returns
     */
    public async getChallenges(): Promise<GetChallengesResult> {
        const account = this.client.account;
        if (!account) throw new Error('Account not logged in');

        const data = await this.baseRequest('getChallenges', {
            chk: generateRewardChk(KEYS.CHALLENGES),
            udid: account.udid,
            accountID: account.accountID,
            gjp2: gjp2(account.password),
        });

        const { startString, info, hash, isHashValid } = decodeRewardResponse(data, KEYS.CHALLENGES, SALTS.CHALLENGES);

        return {
            randomString1: startString,
            randomString2: info[0],
            playerID: Number(info[1]),
            chkNumber: Number(info[2]),
            udid: info[3],
            accountID: Number(info[4]),
            newQuestsCooldown: Number(info[5]),
            quests: info.slice(6, 9).map((quest) => {
                const fields = quest.split(',');

                return {
                    unknown: fields[0],
                    type: Number(fields[1]),
                    amount: Number(fields[2]),
                    reward: Number(fields[3]),
                    name: fields[4],
                };
            }),
            hash,
            isHashValid,
        };
    }
}
