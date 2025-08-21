import * as c from './constants.js';
import LeaderboardType from './enums/LeaderboardType.js';
import * as accounts from './server/accounts.js';
import CommentClient from './server/CommentClient.js';
import UserClient from './server/UserClient.js';
import * as songs from './server/songs.js';
import SocialsClient from './server/SocialsClient.js';
import * as u from './utils.js';
import * as rewards from './server/rewards.js';
import LeaderboardClient, { GetPlatformerLevelScoresOptions } from './server/LeaderboardClient.js';
import { GenericRequestOptions } from './server/generic.js';
import { AxiosRequestConfig } from 'axios';
import Account from './Account.js';
import LevelManager from './managers/LevelManager.js';
import Version from './interfaces/Version.js';
import LikeClient from './server/LikeClient.js';
import ListManager from './managers/ListManager.js';

export default class Client {
    public endpoints: Record<string, string>;
    public headers: object;
    public versions: Version = {
        gameVersion: 22,
        binaryVersion: 42,
    };
    public account?: Account;
    public readonly comments = new CommentClient(this);
    public readonly leaderboardClient = new LeaderboardClient(this);
    public readonly levels = new LevelManager(this);
    public readonly likeClient = new LikeClient(this);
    public readonly lists = new ListManager(this);
    public readonly socialsClient = new SocialsClient(this);
    public readonly users = new UserClient(this);
    public auth?: { accountID: number; gjp2: string };

    public constructor(endpoints?: Record<string, string>, headers?: object) {
        this.endpoints = endpoints ?? c.DefaultEndpoints;
        this.headers = headers ?? c.DEFAULT_HEADERS_22;
    }

    public login(playerID: number, accountID: number, password: string, username: string, udid: string) {
        this.account = new Account(this, playerID, accountID, password, username, udid);
        this.auth = {
            accountID,
            gjp2: u.gjp2(password),
        };
    }

    public likeAccountPost(postID: number, accountID: number, like: boolean) {
        return this.likeClient.likeItem(postID, accountID, 3, like ? 1 : 0);
    }

    public getSongInfo(
        songID: number,
        callback: (data: u.Song) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        songs.getSongInfo(songID, this, params, callback, options);
    }

    public getTopArtists(
        page: number,
        callback: (data: songs.ArtistResult) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        songs.getTopArtists(page, this, params, callback, options);
    }

    public registerAccount(
        username: string,
        email: string,
        password: string,
        callback: (isSuccess: boolean) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.registerAccount(username, email, password, this, params, callback, options);
    }

    public loginAccount(
        username: string,
        password: string,
        callback: (data: accounts.LoginAccountResult) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.loginAccount(username, password, this, params, callback, options);
    }

    public async getGlobalStarLeaderboards() {
        return await this.leaderboardClient.getLeaderboards(LeaderboardType.TOP);
    }

    public async getRelativeLeaderboards() {
        return await this.leaderboardClient.getLeaderboards(LeaderboardType.RELATIVE);
    }

    public async getFriendLeaderboards() {
        return await this.leaderboardClient.getLeaderboards(LeaderboardType.FRIENDS);
    }

    public async getGlobalCreatorLeaderboards() {
        return await this.leaderboardClient.getLeaderboards(LeaderboardType.CREATORS);
    }

    public getDailyChests(
        callback: (data: rewards.GetRewardResult) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        rewards.getRewards(0, this, params, callback, options);
    }

    public getQuests(
        callback: (data: rewards.GetChallengesResult) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        rewards.getChallenges(this, params, callback, options);
    }

    public requestModAccess(
        callback: (data: string | false) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.requestModAccess(this, params, callback, options);
    }

    public async getUserList(type: number) {
        return await this.socialsClient.getUserList(type);
    }

    public async getFriendsList() {
        return await this.socialsClient.getUserList(0);
    }

    public async getBlockList() {
        return await this.socialsClient.getUserList(1);
    }

    public loadSaveData(
        callback: (data: accounts.SaveData) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.loadSaveData(this, params, callback, options);
    }

    public backupSaveData(
        gameManager: string,
        localLevels: string,
        callback: (data: string) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.backupSaveData(gameManager, localLevels, this, params, callback, options);
    }

    public async getMessages(page: number, type: number) {
        return await this.socialsClient.getMessages(page, type);
    }

    public async getIncomingMessages(page: number) {
        return await this.socialsClient.getMessages(page, 0);
    }

    public async getOutgoingMessages(page: number) {
        return await this.socialsClient.getMessages(page, 1);
    }

    public async readMessage(id: number, isSender: boolean) {
        return await this.socialsClient.readMessage(id, isSender);
    }

    public async sendMessage(accountID: number, subject: string, body: string) {
        return await this.socialsClient.sendMessage(accountID, subject, body);
    }

    public async deleteMessage(id: number, isSender: boolean) {
        return await this.socialsClient.deleteMessage(id, isSender);
    }

    public async blockUser(accountID: number) {
        return await this.socialsClient.blockUser(accountID);
    }

    public async unblockUser(accountID: number) {
        return await this.socialsClient.unblockUser(accountID);
    }

    public async getFriendRequests(page: number, type: number) {
        return await this.socialsClient.getFriendRequests(page, type);
    }

    public async getIncomingFriendRequests(page: number) {
        return await this.socialsClient.getFriendRequests(page, 0);
    }

    public async getOutgoingFriendRequests(page: number) {
        return await this.socialsClient.getFriendRequests(page, 1);
    }

    public async deleteFriendRequests(accountIDs: number[], isSender: boolean) {
        return await this.socialsClient.deleteFriendRequests(accountIDs, isSender);
    }

    public async sendFriendRequest(accountID: number, comment: string) {
        return await this.socialsClient.sendFriendRequest(accountID, comment);
    }

    public async readFriendRequest(requestID: number) {
        return await this.socialsClient.readFriendRequest(requestID);
    }

    public async acceptFriendRequest(targetAccountID: number, requestID: number) {
        return await this.socialsClient.acceptFriendRequest(requestID, targetAccountID);
    }

    public async removeFriend(targetAccountID: number) {
        return await this.socialsClient.removeFriend(targetAccountID);
    }

    public getAccountURL(
        type: number,
        callback: (data: string | false) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.getAccountURL(type, this, params, callback, options);
    }

    public getBackupAccountURL(
        callback: (data: string | false) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.getAccountURL(1, this, params, callback, options);
    }

    public getSyncAccountURL(
        callback: (data: string | false) => void,
        params?: GenericRequestOptions,
        options?: AxiosRequestConfig,
    ) {
        accounts.getAccountURL(2, this, params, callback, options);
    }

    public async getLevelScores(levelID: number, type: number) {
        return await this.leaderboardClient.getClassicLeaderboard(levelID, type);
    }

    public async getPlatformerLevelScores(
        levelID: number,
        type: number,
        mode: number,
        opts: GetPlatformerLevelScoresOptions,
    ) {
        return await this.leaderboardClient.getPlatformerLevelScores(levelID, type, mode, opts);
    }

    public toJSON() {
        return {
            endpoints: this.endpoints,
            headers: this.headers,
            versions: this.versions,
            account: this.account?.toJSON(),
            comments: this.comments.toJSON(),
            levels: this.levels.toJSON(),
            likeClient: this.likeClient.toJSON(),
            lists: this.lists.toJSON(),
            socialsClient: this.socialsClient.toJSON(),
            users: this.users.toJSON(),
        };
    }
}
