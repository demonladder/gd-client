import { LevelLength, LevelSearchType } from '../enums';

export interface GetLevelsOptions {
    query?: string;
    type?: LevelSearchType;
    count?: number;
    page?: number;
    difficulties?: number[];
    accountIDs?: number[];
    levelIDs?: number[];
    length?: LevelLength;
    unrated?: boolean;
    rated?: boolean;
    featured?: boolean;
    epic?: boolean;
    legendary?: boolean;
    mythic?: boolean;
    coins?: boolean;
    twoPlayer?: boolean;
    original?: boolean;
    uncompleted?: boolean;
    completed?: boolean;
    customSong?: number;
    songID?: number;
    demonFilter?: number;
    playerID?: number;
    listID?: number;
}
