import { LeaderboardType } from './enums';
import { CommentClient } from './server/CommentClient';
import { UserClient } from './server/UserClient';
import { SocialsClient } from './server/SocialsClient';
import { gjp2 } from './util';
import { GetPlatformerLevelScoresOptions, LeaderboardClient } from './server/LeaderboardClient';
import { Account } from './Account';
import { LevelManager } from './managers/LevelManager';
import { Version } from './interfaces/Version';
import { AuthCredentials } from './interfaces/AuthCredentials';
import { LikeClient } from './server/LikeClient';
import { ListManager } from './managers/ListManager';
import { RewardClient } from './server/RewardClient';
import { DEFAULT_HEADERS_22, DefaultEndpoints } from './constants';
import { SongClient } from './server/SongClient';
import { AccountClient } from './server/AccountClient';

export class Client {
    public versions: Version = {
        gameVersion: 22,
        binaryVersion: 42,
    };
    public account?: Account;
    public readonly accountClient = new AccountClient(this);
    public readonly comments = new CommentClient(this);
    public readonly leaderboardClient = new LeaderboardClient(this);
    public readonly levels = new LevelManager(this);
    public readonly likeClient = new LikeClient(this);
    public readonly lists = new ListManager(this);
    public readonly rewards = new RewardClient(this);
    public readonly socialsClient = new SocialsClient(this);
    public readonly songs = new SongClient(this);
    public readonly users = new UserClient(this);
    public auth?: AuthCredentials;

    public constructor(
        public endpoints: Record<string, string> = DefaultEndpoints,
        public headers: object = DEFAULT_HEADERS_22,
    ) {}

    public login(playerID: number, accountID: number, password: string, username: string, udid: string) {
        this.account = new Account(this, playerID, accountID, password, username, udid);
        this.auth = {
            accountID,
            gjp2: gjp2(password),
        };
    }

    public likeAccountPost(postID: number, accountID: number, like: boolean) {
        return this.likeClient.likeItem(postID, accountID, 3, like ? 1 : 0);
    }

    public async getSongInfo(songID: number) {
        return await this.songs.getSongInfo(songID);
    }

    public async getTopArtists(page: number) {
        return await this.songs.getTopArtists(page);
    }

    public async registerAccount(username: string, email: string, password: string) {
        return await this.accountClient.registerAccount(username, email, password);
    }

    public async loginAccount(username: string, password: string) {
        return await this.accountClient.loginAccount(username, password);
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

    public async getDailyChests() {
        return await this.rewards.getRewards(0);
    }

    public async getQuests() {
        return await this.rewards.getChallenges();
    }

    public async requestModAccess() {
        return await this.accountClient.requestModAccess();
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

    public async loadSaveData() {
        return await this.accountClient.loadSaveData();
    }

    public async backupSaveData(gameManager: string, localLevels: string) {
        return await this.accountClient.backupSaveData(gameManager, localLevels);
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

    public async getAccountURL(type: number) {
        return await this.accountClient.getAccountURL(type);
    }

    public async getBackupAccountURL() {
        return await this.accountClient.getAccountURL(1);
    }

    public async getSyncAccountURL() {
        return await this.accountClient.getAccountURL(2);
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
            accountClient: this.accountClient.toJSON(),
            comments: this.comments.toJSON(),
            leaderboardClient: this.leaderboardClient.toJSON(),
            levels: this.levels.toJSON(),
            likeClient: this.likeClient.toJSON(),
            lists: this.lists.toJSON(),
            rewards: this.rewards.toJSON(),
            socialsClient: this.socialsClient.toJSON(),
            songs: this.songs.toJSON(),
            users: this.users.toJSON(),
        };
    }
}
