import { Base } from '../Base';
import { Client } from '../Client';
import { ClassProperties } from '../types/ClassProperties';
import { ContentType, LevelLength } from '../enums';
import { LevelCommentManager } from '../managers/LevelCommentManager';

export class Level extends Base {
    public readonly ID: number;
    public readonly description?: string;

    /**
     * The raw level data.
     */
    public readonly levelString?: string;
    public readonly version?: number;

    /**
     * ID of the player that uploaded this level.
     */
    public readonly playerID?: number;
    public readonly difficulty?: number;
    public readonly completions?: number;

    /**
     * The official song ID this level uses. Undefined if using a custom song.
     */
    public readonly officialSong?: number;

    /**
     * The game version when this level was uploaded.
     * `X` versions translate to `1.X` and `XX` translates to `X.X`.
     * `7` would be `v1.7` and `22` would be `v2.2`.
     */
    public readonly gameVersion: number;
    public readonly likes: number;
    public readonly downloads: number;
    public readonly length: LevelLength;

    /**
     * How many stars this level grants on completion.
     */
    public readonly stars?: number;
    public readonly featureScore: number;
    public readonly copiedFromID?: number;

    /**
     * The Newgrounds audio ID this level uses. Undefined if using an official song.
     */
    public readonly customSongID?: number;

    /**
     * How many coins this level has.
     */
    public readonly coins: number;
    public readonly starsRequested: number;
    public readonly dailyNumber?: number;
    public readonly epicRating: number;
    public readonly demonDifficulty: number;
    public readonly objects?: number;
    public readonly editorTimeSeconds?: number;
    public readonly editorTimeCopiesSeconds?: number;
    public readonly verificationTimeFrames?: number;
    public readonly isDemon: boolean;
    public readonly isAuto: boolean;
    public readonly isTwoPlayer: boolean;

    /**
     * True if the coins were collected during verification.
     */
    public readonly areCoinsVerified: boolean;
    public readonly isLowDetailMode: boolean;
    public readonly isGauntlet: boolean;
    public readonly name: string;
    public readonly recordString?: string;

    /**
     * When the level was uploaded as an ISO 8601 string with the format `YYYY-MM-DDTHH:mm:ss.SSSZ`.
     */
    public readonly uploadDate?: string;

    /**
     * When the level was last updated as an ISO 8601 string with the format `YYYY-MM-DDTHH:mm:ss.SSSZ`.
     */
    public readonly updateDate?: string;
    public readonly extraString?: string;
    public readonly settingsString?: string;
    public readonly password?: string;
    public readonly songIds: number[];
    public readonly sfxIds: number[];

    public readonly comments: LevelCommentManager;

    public constructor(client: Client, data: Omit<ClassProperties<Level>, 'client' | 'comments'>) {
        super(client);

        this.ID = data.ID;
        this.description = data.description;
        this.levelString = data.levelString;
        this.version = data.version;
        this.playerID = data.playerID;
        this.difficulty = data.difficulty;
        this.completions = data.completions;
        this.officialSong = data.officialSong;
        this.gameVersion = data.gameVersion;
        this.likes = data.likes;
        this.downloads = data.downloads;
        this.length = data.length;
        this.stars = data.stars;
        this.featureScore = data.featureScore;
        this.copiedFromID = data.copiedFromID;
        this.customSongID = data.customSongID;
        this.coins = data.coins;
        this.starsRequested = data.starsRequested;
        this.dailyNumber = data.dailyNumber;
        this.epicRating = data.epicRating;
        this.demonDifficulty = data.demonDifficulty;
        this.objects = data.objects;
        this.editorTimeSeconds = data.editorTimeSeconds;
        this.editorTimeCopiesSeconds = data.editorTimeCopiesSeconds;
        this.verificationTimeFrames = data.verificationTimeFrames;
        this.isDemon = data.isDemon;
        this.isAuto = data.isAuto;
        this.isTwoPlayer = data.isTwoPlayer;
        this.areCoinsVerified = data.areCoinsVerified;
        this.isLowDetailMode = data.isLowDetailMode;
        this.isGauntlet = data.isGauntlet;
        this.name = data.name;
        this.recordString = data.recordString;
        this.uploadDate = data.uploadDate;
        this.updateDate = data.updateDate;
        this.extraString = data.extraString;
        this.settingsString = data.settingsString;
        this.songIds = data.songIds;
        this.sfxIds = data.sfxIds;

        this.comments = new LevelCommentManager(client, this);
    }

    /**
     * Like the level.
     */
    public async like() {
        await this.client.likeClient.likeItem(this.ID, 0, ContentType.LEVEL, 1);
    }

    /**
     * Attempts to remove the level from the servers.
     */
    public async destroy() {
        await this.client.levels.delete(this.ID);
    }

    public toJSON() {
        return {
            ID: this.ID,
            name: this.name,
            description: this.description,
            password: this.password,
            levelString: this.levelString,
            version: this.version,
            playerID: this.playerID,
            difficulty: this.difficulty,
            completions: this.completions,
            officialSong: this.officialSong,
            gameVersion: this.gameVersion,
            likes: this.likes,
            downloads: this.downloads,
            length: this.length,
            stars: this.stars,
            featureScore: this.featureScore,
            copiedFromID: this.copiedFromID,
            customSongID: this.customSongID,
            coins: this.coins,
            starsRequested: this.starsRequested,
            dailyNumber: this.dailyNumber,
            epicRating: this.epicRating,
            demonDifficulty: this.demonDifficulty,
            objects: this.objects,
            editorTimeSeconds: this.editorTimeSeconds,
            editorTimeCopiesSeconds: this.editorTimeCopiesSeconds,
            verificationTimeFrames: this.verificationTimeFrames,
            isDemon: this.isDemon,
            isAuto: this.isAuto,
            isTwoPlayer: this.isTwoPlayer,
            areCoinsVerified: this.areCoinsVerified,
            isLowDetailMode: this.isLowDetailMode,
            isGauntlet: this.isGauntlet,
            recordString: this.recordString,
            uploadDate: this.uploadDate,
            updateDate: this.updateDate,
            extraString: this.extraString,
            settingsString: this.settingsString,
            comments: this.comments.toJSON(),
        };
    }

    public toString(pretty = false): string {
        if (pretty) return JSON.stringify(this.toJSON(), null, 4);
        return JSON.stringify(this.toJSON());
    }
}
