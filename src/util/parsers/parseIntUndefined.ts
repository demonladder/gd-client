/**
 * Parses a string to an integer or returns undefined if the string is empty or undefined.
 * @param {string} num The string to parse.
 */
export default function parseIntUndefined(num?: string): number | undefined {
    return num ? parseInt(num) : undefined;
}
