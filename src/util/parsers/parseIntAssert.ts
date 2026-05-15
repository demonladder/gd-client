/**
 * Parses a string to an integer or throws an error if the string is empty or undefined.
 * @param num The string to parse.
 * @returns The parsed integer.
 */
export function parseIntAssert(num?: string): number {
    if (!num) throw new Error('Parsing error: Number is missing.');
    return parseInt(num);
}
