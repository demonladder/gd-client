export class GdApiError extends Error {
    public constructor(
        message: string,
        public readonly code: number,
    ) {
        super(message);
    }
}
