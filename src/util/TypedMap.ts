export class TypedMap extends Map<string, string> {
    public getOrThrow(key: string, message?: string): string {
        const value = this.get(key);
        if (value === undefined) throw new Error(message ?? 'Key does not hold a value');
        return value;
    }

    public getInt(key: string) {
        const value = super.get(key);
        if (!value) return undefined;
        const parsed = parseInt(value);
        return Number.isSafeInteger(parsed) ? parsed : undefined;
    }

    public getIntOr(key: string, or: number) {
        return this.getInt(key) ?? or;
    }

    public getIntOrElse(key: string, or: () => number) {
        return this.getInt(key) ?? or();
    }

    public getIntOrThrow(key: string, message?: string): number {
        const number = this.getInt(key);
        if (number === undefined) throw new Error(message ?? `\`${key}\` is not an integer`);
        return number;
    }

    public getBool(key: string) {
        return super.get(key) === '1';
    }
}
