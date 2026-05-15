import { Base } from '../Base';
import { Client } from '../Client';
import { ClassProperties } from '../types/ClassProperties';
import { ContentType, LevelLength } from '../enums';
import { LevelCommentManager } from '../managers/LevelCommentManager';

export class Level extends Base {
    public readonly ID: number;
    public readonly levelString?: string;
    public readonly version: number;
    public readonly playerID: number;
    public readonly difficulty: number;
    public readonly completions?: number;
    public readonly officialSong: number;
    public readonly gameVersion: number;
    public readonly likes: number;
    public readonly length: LevelLength;
    public readonly stars: number;
    public readonly featureScore: number;
    public readonly copiedFromID: number;
    public readonly customSongID: number;
    public readonly coins: number;
    public readonly starsRequested: number;
    public readonly dailyNumber?: number;
    public readonly epicRating: number;
    public readonly demonDifficulty: number;
    public readonly objects: number;
    public readonly editorTimeSeconds: number;
    public readonly editorTimeCopiesSeconds: number;
    public readonly verificationTimeFrames?: number;
    public readonly isDemon: boolean;
    public readonly isAuto: boolean;
    public readonly isTwoPlayer: boolean;
    public readonly areCoinsVerified: boolean;
    public readonly isLowDetailMode: boolean;
    public readonly isGauntlet: boolean;
    public readonly name: string;
    public readonly recordString?: string;
    public readonly uploadDate?: string;
    public readonly updateDate?: string;
    public readonly extraString?: string;
    public readonly settingsString?: string;
    public readonly password?: string;

    public readonly comments: LevelCommentManager;

    public constructor(client: Client, data: Omit<ClassProperties<Level>, 'client' | 'comments'>) {
        super(client);

        this.ID = data.ID;
        this.levelString = data.levelString;
        this.version = data.version;
        this.playerID = data.playerID;
        this.difficulty = data.difficulty;
        this.completions = data.completions;
        this.officialSong = data.officialSong;
        this.gameVersion = data.gameVersion;
        this.likes = data.likes;
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
            levelString: this.levelString,
            version: this.version,
            playerID: this.playerID,
            difficulty: this.difficulty,
            completions: this.completions,
            officialSong: this.officialSong,
            gameVersion: this.gameVersion,
            likes: this.likes,
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
            name: this.name,
            recordString: this.recordString,
            uploadDate: this.uploadDate,
            updateDate: this.updateDate,
            extraString: this.extraString,
            settingsString: this.settingsString,
            comments: this.comments.toJSON(),
        };
    }
}
