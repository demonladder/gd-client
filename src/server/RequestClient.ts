import axios from 'axios';
import { Base } from '../Base';
import { DEFAULT_SERVER, SECRETS, VERSIONLESS_ENDPOINTS } from '../constants';
import { Client } from '../Client';
import { GdApiError } from '../types/gdApiError';

export interface RequestOptions {
    secret?: string;
    /**
     * The server to send the request to. A few endpoints — account login, backup and sync — live
     * on `DEFAULT_ACCOUNT_URL` rather than `DEFAULT_SERVER`, which is the default.
     */
    server?: string;
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
