import axios from 'axios';
import Base from '../Base.js';
import { DEFAULT_SERVER, SECRETS, VERSIONLESS_ENDPOINTS } from '../constants.js';
import Client from '../Client.js';
import { GDAPIError } from './generic.js';

export interface RequestOptions {
    secret?: string;
}

/**
 * Super class that directly handles requests to the Geometry Dash servers.
 */
export default class RequestClient extends Base {
    private readonly axios = axios.create({
        baseURL: DEFAULT_SERVER,
    });

    public constructor(client: Client) {
        super(client);
    }

    /**
     * @throws {GDAPIError | axios.AxiosError} This method can throw errors from the API or from axios.
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
        const requestData: Record<string, string | number> = {
            secret: options?.secret ?? SECRETS.COMMON,
            gdw: 0,
            ...paramsInternal,
            ...options,
        };
        if (!VERSIONLESS_ENDPOINTS.includes(endpoint)) {
            requestData.gameVersion = this.client.versions.gameVersion;
            requestData.binaryVersion = this.client.versions.binaryVersion;
        }

        const url = new URL(`${DEFAULT_SERVER}/${this.client.endpoints[endpoint]}`);

        const res = await this.axios.post<T>(url.toString(), requestData, {
            headers: {
                ...this.client.headers,
                Host: url.host,
            },
        });

        if (res.data === -1 || (typeof res.data === 'string' && parseInt(res.data) === -1))
            throw new GDAPIError('API request failed. Response: -1', -1);

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
