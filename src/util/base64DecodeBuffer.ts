export function base64DecodeBuffer(str: string) {
    return Buffer.from(str.replace(/\+/g, '-').replace(/\//g, '_'), 'base64url');
}
