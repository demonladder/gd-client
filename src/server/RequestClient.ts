import axios from 'axios';
import { Base } from '../Base';
import { DEFAULT_SERVER, SECRETS, VERSIONLESS_ENDPOINTS } from '../constants';
import { Client } from '../Client';
import { Account } from '../Account';
import { AuthCredentials } from '../interfaces/AuthCredentials';
import { AuthenticationError } from '../types/AuthenticationError';
import { GdApiError } from '../types/gdApiError';

export interface RequestOptions {
    secret?: string;
    /**
     * The server to send the request to. A few endpoints — account login, backup and sync — live
     * on `DEFAULT_ACCOUNT_URL` rather than `DEFAULT_SERVER`, which is the default.
     */
    server?: string;
}

export interface AuthContext {
    /**
     * `accountID` and `gjp2`, ready to be spread into a request body.
     */
    auth: AuthCredentials;
    /**
     * The logged in account, for the endpoints that also want `udid`, `uuid` or `userName`.
     */
    account: Account;
}

/**
 * Super class that directly handles requests to the Geometry Dash servers.
 */
export class RequestClient extends Base {
    private readonly axios = axios.create({
        baseURL: DEFAULT_SERVER,
    });

    public constructor(client: Client) {
        super(client);
    }

    /**
     * @throws A {@link GdApiError} or an AxiosError.
     * @param endpoint
     * @param paramsInternal
     * @param options
     * @returns
     */
    protected async baseRequest<T = string>(
        endpoint: string,
        paramsInternal: Record<string, string | number | undefined> = {},
        options?: RequestOptions,
    ): Promise<T> {
        const { server = DEFAULT_SERVER, ...bodyOptions } = options ?? {};

        const requestData: Record<string, string | number> = {
            secret: bodyOptions.secret ?? SECRETS.COMMON,
            gdw: 0,
            ...paramsInternal,
            ...bodyOptions,
        };
        if (!VERSIONLESS_ENDPOINTS.includes(endpoint)) {
            requestData.gameVersion = this.client.versions.gameVersion;
            requestData.binaryVersion = this.client.versions.binaryVersion;
        }

        const url = new URL(`${server}/${this.client.endpoints[endpoint]}`);

        const res = await this.axios.post<T>(url.toString(), requestData, {
            headers: {
                ...this.client.headers,
                Host: url.host,
            },
        });

        if (res.data === -1 || (typeof res.data === 'string' && parseInt(res.data) === -1))
            throw new GdApiError('API request failed. Response: -1', -1);

        return res.data;
    }

    /**
     * Resolves the credentials {@link Client.login} stored, for the endpoints that require them.
     * `Client.account` and `Client.auth` are only ever set together, so this covers both.
     *
     * @throws {AuthenticationError} Throws if the client has not logged in.
     * @param action What the caller is about to do, used to build the error message.
     * @returns
     */
    protected requireAuth(action: string): AuthContext {
        const { auth, account } = this.client;
        if (!auth || !account) throw new AuthenticationError(action);

        return { auth, account };
    }

    protected accountRequest<T = string>(
        endpoint: string,
        paramsInternal: Record<string, string | number> = {},
        options?: RequestOptions,
    ): Promise<T> {
        return this.baseRequest(endpoint, paramsInternal, {
            secret: SECRETS.ACCOUNT,
            ...options,
        });
    }

    public toJSON() {
        return {};
    }
}
