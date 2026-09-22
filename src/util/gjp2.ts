import { Salt } from '../constants';
import { sha1 } from '.';

export function gjp2(str: string) {
    return sha1(str + Salt.GJP2);
}
