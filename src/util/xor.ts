export function xor(str: string, key: string) {
    return str
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
        .join('');
}
