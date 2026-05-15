/**
 * Converts a string array of key value pairs seperated by a character into a map
 *
 * `"1:22:5:1:10:1000"` -> `{ 1: "22", 5: "1", 10: "1000" }`
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Map<string, string>} The map of key value pairs
 */

export function robTopSplit(str: string, sep: string): Map<string, string> {
    const map = new Map<string, string>();
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        map.set(arr[i], arr[i + 1]);
    }
    return map;
}

/**
 * Similar to {@link robTopSplit} but returns an object instead of a map
 *
 * `"1:22:5:1:10:1000"` -> `{ 1: "22", 5: "1", 10: "1000" }` -> `{ id: 22, version: 1, downloads: 1000 }`
 * @param {string} str The string to split
 * @param {string} sep The character to seperate the string by
 * @returns {Record<string, string>} The object of keys and their values
 */

export function robTopSplitDict(str: string, sep: string): Record<string, string> {
    const object: Record<string, string> = {};
    const arr = str.split(sep);
    for (let i = 0; i < arr.length; i += 2) {
        object[arr[i]] = arr[i + 1];
    }
    return object;
}
