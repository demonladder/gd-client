import axios, { AxiosRequestConfig } from 'axios';
import { Client } from '../Client';
import { DEFAULT_ACCOUNT_URL, DEFAULT_SERVER, SECRETS, VERSIONLESS_ENDPOINTS } from '../constants';

export class GDAPIError extends Error {
    public constructor(
        message: string,
        public readonly code: number,
    ) {
        super(message);
    }
}

export interface GenericRequestOptions {
    increment?: number;
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
    accountID?: number;
    gjp2?: string;
    weekly?: number;
    secret?: string;
}

export function genericRequest<T = string>(
    endpoint: string,
    paramsInternal: Record<string, string | number> = {},
    callbackInternal: (data: T) => void,
    instance: Client,
    options: GenericRequestOptions,
    axiosOptions?: AxiosRequestConfig,
) {
    const requestData = {
        secret: options.secret ?? SECRETS.COMMON,
        ...paramsInternal,
        ...options,
    };
    if (!VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        requestData.gameVersion = instance.versions.gameVersion;
        requestData.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    requestData.gdw = 0;

    const hostElem = new URL(DEFAULT_SERVER).host;

    axios
        .post<T>(`${DEFAULT_SERVER}/${instance.endpoints[endpoint]}`, requestData, {
            headers: {
                ...instance.headers,
                Host: hostElem,
            },
            ...axiosOptions,
        })
        .then((res) => {
            callbackInternal(res.data);
        })
        .catch((e: unknown) => {
            throw e;
        });
}

export interface AccountRequestOptions {
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
    secret?: string;
}

export function accountRequest<T = string>(
    endpoint: string,
    paramsInternal: Record<string, string | number> = {},
    callbackInternal: (data: T) => void,
    instance: Client,
    options: AccountRequestOptions = {},
    axiosOptions?: AxiosRequestConfig,
) {
    const requestData = {
        secret: options.secret ?? SECRETS.ACCOUNT,
        ...paramsInternal,
        ...options,
    };
    if (!VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        requestData.gameVersion = instance.versions.gameVersion;
        requestData.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    requestData.gdw = 0;

    const hostElem = new URL(DEFAULT_ACCOUNT_URL).host;

    // console.log(opts)
    axios
        .post<T>(`${DEFAULT_ACCOUNT_URL}/${instance.endpoints[endpoint]}`, requestData, {
            headers: {
                ...instance.headers,
                Host: hostElem,
            },
            ...axiosOptions,
        })
        .then((data) => {
            // if (data.data < 0) throw new Error(data.data)
            callbackInternal(data.data);
        })
        .catch((e) => {
            throw e;
        });
}

export interface ContentRequestOptions {
    gameVersion?: number;
    binaryVersion?: number;
    gdw?: number;
}
