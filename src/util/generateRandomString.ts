import { RS_CHARACTERS } from '../constants';

/**
 * Generates a random string of a specified length using the provided character set.
 * If no character set is provided, a default set of characters is used.
 *
 * @param {number} n - The length of the random string to generate.
 * @param {string[]} [charset] - An optional array of characters to use for generating the random string.
 * @returns {string} A random string of length `n` composed of characters from the `charset`.
 */
export function generateRandomString(n: number, charset: string[] = RS_CHARACTERS): string {
    return new Array(n)
        .fill('0')
        .map((_) => charset[Math.floor(Math.random() * charset.length)])
        .join('');
}
