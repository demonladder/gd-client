import { genericRequest, GenericRequestOptions } from './generic';
import { base64Decode, base64Encode, generateRandomString, getRandomNumber, gjp2, sha1, xor } from '../util';
import { Client } from '../Client';
import { AxiosRequestConfig } from 'axios';
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

export function getRewards(
    type: number,
    instance: Client,
    params: GenericRequestOptions = {},
    callback: (data: GetRewardResult) => void,
    options?: AxiosRequestConfig,
) {
    if (!instance.account) throw new Error('Account not logged in');
    genericRequest(
        'getRewards',
        {
            chk: `${generateRandomString(5)}${base64Encode(xor(getRandomNumber(10000, 1000000).toString(), KEYS.CHEST_REWARDS))}`,
            rewardType: type,
            r1: getRandomNumber(100, 99999),
            r2: getRandomNumber(100, 99999),
            udid: instance.account.udid,
            accountID: instance.account.accountID,
            gjp2: gjp2(instance.account.password),
        },
        function (data) {
            if (data == '-1') throw new Error('-1');
            const segments = data.split('|');
            const infoRaw = segments[0].slice(5);
            const info = xor(base64Decode(infoRaw), KEYS.CHEST_REWARDS).split(':');
            const startString = segments[0].slice(0, 5);
            const small = info[6].split(',');
            const big = info[9].split(',');
            const hash = segments[1];

            callback({
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
                isHashValid: sha1(infoRaw + SALTS.REWARDS) == hash,
            });
        },
        instance,
        params,
        options,
    );
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

export function getChallenges(
    instance: Client,
    params: GenericRequestOptions = {},
    callback: (data: GetChallengesResult) => void,
    options?: AxiosRequestConfig,
) {
    if (!instance.account) throw new Error('Account not logged in');
    genericRequest(
        'getChallenges',
        {
            chk: `${generateRandomString(5)}${base64Encode(xor(getRandomNumber(10000, 1000000).toString(), KEYS.CHALLENGES))}`,
            udid: instance.account.udid,
            accountID: instance.account.accountID,
            gjp2: gjp2(instance.account.password),
        },
        function (data) {
            if (data == '-1') throw new Error('-1');
            const segments = data.split('|');
            const infoRaw = segments[0].slice(5);
            const info = xor(base64Decode(infoRaw), KEYS.CHALLENGES).split(':');
            const startString = segments[0].slice(0, 5);
            const quest1 = info[6].split(',');
            const quest2 = info[7].split(',');
            const quest3 = info[8].split(',');
            const hash = segments[1];
            callback({
                randomString1: startString,
                randomString2: info[0],
                playerID: Number(info[1]),
                chkNumber: Number(info[2]),
                udid: info[3],
                accountID: Number(info[4]),
                newQuestsCooldown: Number(info[5]),
                quests: [
                    {
                        unknown: quest1[0],
                        type: Number(quest1[1]),
                        amount: Number(quest1[2]),
                        reward: Number(quest1[3]),
                        name: quest1[4],
                    },
                    {
                        unknown: quest2[0],
                        type: Number(quest2[1]),
                        amount: Number(quest2[2]),
                        reward: Number(quest2[3]),
                        name: quest2[4],
                    },
                    {
                        unknown: quest3[0],
                        type: Number(quest3[1]),
                        amount: Number(quest3[2]),
                        reward: Number(quest3[3]),
                        name: quest3[4],
                    },
                ],
                hash,
                isHashValid: sha1(infoRaw + SALTS.CHALLENGES) == hash,
            });
        },
        instance,
        params,
        options,
    );
}
