import { gunzipSync, inflateRawSync, inflateSync, unzipSync } from 'zlib';

export function tryUnzip(data: Buffer): Buffer {
    try {
        return inflateSync(data);
    } catch {
        try {
            return inflateRawSync(data);
        } catch {
            try {
                return gunzipSync(data);
            } catch {
                try {
                    return unzipSync(data);
                } catch {
                    return data;
                }
            }
        }
    }
}
