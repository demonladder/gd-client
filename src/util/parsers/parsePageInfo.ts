import { PageInfo } from '../../interfaces/PageInfo';

/**
 * Parses the `total:offset:pageSize` segment that most list endpoints end with.
 *
 * @param segment The raw pagination segment.
 * @returns
 */
export function parsePageInfo(segment: string): PageInfo {
    const [total, offset, pageSize] = segment.split(':').map(Number);

    return { total, offset, pageSize };
}
