import { base64DecodeBuffer } from '.';

export function base64Decode(str: string) {
    return base64DecodeBuffer(str).toString('ascii');
}
