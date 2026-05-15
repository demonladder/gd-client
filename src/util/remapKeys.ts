export function remapKeys<T>(obj: Map<string, T>, keyMap: Record<string, string>): Record<string, T | undefined> {
    const newObj = {} as Record<string, T | undefined>;

    for (const [key, value] of obj.entries()) {
        if (keyMap[key]) newObj[keyMap[key]] = value;
        else throw new Error(`Key map does not contain a definition for the key: "${key}"`);
    }

    return newObj;
}
