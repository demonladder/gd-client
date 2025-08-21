export interface PaginationOptions {
    /**
     * Defaults to 10.
     * Maximum is 100.
     * If set below 0, will return every comment.
     */
    count?: number;

    /**
     * 0-indexed pagination.
     * Defaults to 0
     */
    page?: number;
}
