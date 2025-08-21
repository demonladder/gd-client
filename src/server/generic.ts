import axios, { AxiosRequestConfig } from 'axios';
import * as constants from '../constants.js';
import * as utils from '../utils.js';
import Client from '../Client.js';

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
        secret: options.secret ?? constants.SECRETS.COMMON,
        ...paramsInternal,
        ...options,
    };
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        requestData.gameVersion = instance.versions.gameVersion;
        requestData.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    requestData.gdw = 0;

    const hostElem = new URL(constants.DEFAULT_SERVER).host;

    axios
        .post<T>(`${constants.DEFAULT_SERVER}/${instance.endpoints[endpoint]}`, requestData, {
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
        secret: options.secret ?? constants.SECRETS.ACCOUNT,
        ...paramsInternal,
        ...options,
    };
    if (!constants.VERSIONLESS_ENDPOINTS.includes(endpoint)) {
        requestData.gameVersion = instance.versions.gameVersion;
        requestData.binaryVersion = instance.versions.binaryVersion;
    }
    // if (instance.gdWorld) requestData.gdw = 1;
    // else if (requestData.gameVersion == 21) requestData.gdw = 0;
    requestData.gdw = 0;

    const hostElem = new URL(constants.DEFAULT_ACCOUNT_URL).host;

    // console.log(opts)
    axios
        .post<T>(`${constants.DEFAULT_ACCOUNT_URL}/${instance.endpoints[endpoint]}`, requestData, {
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

export function contentRequest<T = string>(
    endpoint: string,
    paramsInternal = {},
    callbackInternal: (data: T) => void,
    instance: Client,
    params?: ContentRequestOptions,
    options?: AxiosRequestConfig,
) {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const opts = {
        expires,
        token: utils.generateCDNToken('/' + endpoint.replace(/$\//, ''), expires),
        ...paramsInternal,
        ...params,
    };

    const hostElem = new URL(constants.DEFAULT_CONTENT_URL).host;
    let path = instance.endpoints[endpoint];
    if (!path) path = endpoint;

    axios
        .get<T>(`${constants.DEFAULT_CONTENT_URL}/${path}`, {
            headers: {
                'User-Agent': '',
                Host: hostElem,
            },
            params: opts,
            ...options,
        })
        .then((res) => {
            callbackInternal(res.data);
        })
        .catch((e) => {
            throw e;
        });
}
