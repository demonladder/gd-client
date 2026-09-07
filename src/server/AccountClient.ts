import { Client } from '../Client';
import { RequestClient } from './RequestClient';
import { GdApiError } from '../types/gdApiError';
import { DEFAULT_ACCOUNT_URL, SECRETS } from '../constants';
import type { MapPack } from '../types/MapPack';
import { base64DecodeBuffer, gjp2, robTopSplitDict, tryUnzip } from '../util';
import { parseMapPack } from '../util/parsers';

export interface LoginAccountResult {
    accountID: number;
    playerID: number;
}

export interface SaveData {
    gameManager: string;
    localLevels: string;
    gameVersion: number;
    binaryVersion: number;
    ratedLevels: Record<string, number>;
    mappacks: MapPack[];
}

const REGISTER_ERRORS: Record<number, string> = {
    [-2]: 'Username is taken',
    [-3]: 'Email is taken',
    [-4]: 'Username is too long',
    [-5]: 'Invalid password',
    [-6]: 'Invalid email',
    [-8]: 'Username is too short',
    [-9]: 'Password is too short',
};

const LOGIN_ERRORS: Record<number, string> = {
    [-8]: 'Username is too short',
    [-9]: 'Password is too short',
    [-11]: 'Login or password is incorrect',
    [-12]: 'Account is disabled',
};

/**
 * Turns a negative response code into a {@link GdApiError} carrying that code, so callers can
 * branch on the number instead of matching against the message.
 */
function apiError(code: number, messages: Record<number, string>) {
    return new GdApiError(messages[code] ?? `API request failed. Response: ${code}`, code);
}

export class AccountClient extends RequestClient {
    public constructor(client: Client) {
        super(client);
    }

    /**
     * @throws {GdApiError} Throws if the account could not be registered, with the code the API
     * returned — for example -2 when the username is taken.
     * @param username
     * @param email
     * @param password
     * @param secret
     * @returns
     */
    public async registerAccount(username: string, email: string, password: string, secret?: string): Promise<void> {
        const data = await this.baseRequest<number | string>(
            'registerAccount',
            { userName: username, email, password },
            { secret: secret ?? SECRETS.ACCOUNT },
        );

        const code = Number(data);
        if (code !== 1) throw apiError(code, REGISTER_ERRORS);
    }

    /**
     * @throws {Error} Throws if the client has not logged in.
     * @throws {GdApiError} Throws if the login was rejected, with the code the API returned — for
     * example -11 when the credentials are incorrect.
     * @param username
     * @param password
     * @returns
     */
    public async loginAccount(username: string, password: string): Promise<LoginAccountResult> {
        const account = this.client.account;
        if (!account) throw new Error('You must authenticate in order to do this');

        const data = await this.baseRequest<number | string>(
            'loginAccount',
            { userName: username, password, udid: account.udid },
            { secret: SECRETS.ACCOUNT, server: DEFAULT_ACCOUNT_URL },
        );

        const code = Number(data);
        if (code < 0) throw apiError(code, LOGIN_ERRORS);

        const segments = String(data).split(',');

        return {
            accountID: Number(segments[0]),
            playerID: Number(segments[1]),
        };
    }

    /**
     * @throws {Error} Throws if the client has not logged in.
     * @returns The moderator access level, or `false` if the account has none.
     */
    public async requestModAccess(): Promise<string | false> {
        const account = this.client.account;
        if (!account) throw new Error('You must authenticate in order to do this');

        try {
            return await this.baseRequest(
                'requestModAccess',
                {
                    accountID: account.accountID,
                    gjp2: gjp2(account.password),
                },
                { secret: SECRETS.ACCOUNT },
            );
        } catch (err) {
            if (err instanceof GdApiError && err.code === -1) return false;

            throw err;
        }
    }

    /**
     * @throws {Error} Throws if the client has not logged in.
     * @param type
     * @returns The URL to use for the given account action, or `false` if the API returned none.
     */
    public async getAccountURL(type: number): Promise<string | false> {
        try {
            return await this.baseRequest(
                'getAccountURL',
                {
                    accountID: this.client.account?.accountID ?? 18120421,
                    type,
                },
                { secret: SECRETS.ACCOUNT },
            );
        } catch (err) {
            if (err instanceof GdApiError && err.code === -1) return false;

            throw err;
        }
    }

    /**
     * @throws {Error} Throws if the client has not logged in.
     * @returns
     */
    public async loadSaveData(): Promise<SaveData> {
        const account = this.client.account;
        if (!account) throw new Error('You must authenticate in order to load your save data');

        const data = await this.baseRequest(
            'loadSaveData',
            {
                accountID: account.accountID,
                gjp2: gjp2(account.password),
                uuid: account.playerID,
                udid: account.udid,
            },
            { secret: SECRETS.ACCOUNT, server: DEFAULT_ACCOUNT_URL },
        );

        const elements = data.split(';');
        const ratedLevels = robTopSplitDict(unwrapSaveSection(elements[4]), ',');
        const parsedRatedLevels: Record<string, number> = {};
        for (const i of Object.keys(ratedLevels)) {
            parsedRatedLevels[i] = Number(ratedLevels[i]);
        }

        return {
            gameManager: elements[0],
            localLevels: elements[1],
            gameVersion: Number(elements[2]),
            binaryVersion: Number(elements[3]),
            ratedLevels: parsedRatedLevels,
            mappacks: unwrapSaveSection(elements[5])
                .split('|')
                .map((m) => parseMapPack(m)),
        };
    }

    /**
     * @throws {Error} Throws if the client has not logged in.
     * @throws {GdApiError} Throws if the backup was rejected, with the code the API returned.
     * @param gameManager
     * @param localLevels
     * @returns
     */
    public async backupSaveData(gameManager: string, localLevels: string): Promise<string> {
        const account = this.client.account;
        if (!account) throw new Error('You must authenticate in order to backup save data');

        const data = await this.baseRequest(
            'backupSaveData',
            {
                accountID: account.accountID,
                gjp2: gjp2(account.password),
                uuid: account.playerID,
                udid: account.udid,
                saveData: `${gameManager};${localLevels}`,
            },
            { secret: SECRETS.ACCOUNT, server: DEFAULT_ACCOUNT_URL },
        );

        const code = Number(data);
        if (code < 0) throw new GdApiError(`API request failed. Response: ${code}`, code);

        return data;
    }
}

/**
 * Save data sections are base64 encoded and gzipped, wrapped in 20 characters of padding
 * on either end.
 */
function unwrapSaveSection(section: string) {
    return tryUnzip(base64DecodeBuffer(section.slice(20, section.length - 20))).toString('utf8');
}
