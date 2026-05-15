import { createHash, type BinaryToTextEncoding } from 'crypto';

/**
 * Generates a SHA-1 hash of the given string.
 *
 * @param {string} str - The input string to hash.
 * @param {crypto.BinaryToTextEncoding} [digestType="hex"] - The encoding of the output hash. Defaults to "hex".
 * @returns {string} The SHA-1 hash of the input string in the specified encoding.
 */

export function sha1(str: string, digestType: BinaryToTextEncoding = 'hex'): string {
    const hash = createHash('sha1');
    hash.update(str);
    return hash.digest(digestType);
}
