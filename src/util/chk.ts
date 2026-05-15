import { base64Encode } from './base64Encode';
import { xor } from './xor';
import { sha1 } from './sha1';

export function chk(values: (string | number)[], key: string, salt = '') {
    const str = values.join('') + salt;
    return base64Encode(xor(sha1(str), key));
}
