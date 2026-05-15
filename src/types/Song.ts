export interface Song {
    name: string;
    artistID: number;
    artistName: string;
    size: number;
    isVerified: boolean;
    link?: string;
    videoID?: string;
    artistYoutubeURL?: string;
    priority?: number;
    nongType?: number;
    extraArtistIDs?: number[];
    newButtonType?: number;
    extraArtistNames?: string;
    new: boolean;
}
