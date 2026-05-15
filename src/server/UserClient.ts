import { Client } from '../Client';
import { RequestClient } from './RequestClient';
import { parseUser } from '../util/parsers';
import { chk, generateRandomString } from '../util';
import { KEYS, SALTS } from '../constants';

/**
 * Updates your account stats.
 *
 * @param {number} stars Your star count
 * @param {number} moons Your moon count
 * @param {number} demons Your demon count. If left out, defaults to the length of the completedDemons array
 * @param {number} diamonds Your diamond count
 * @param {number} secretCoins Your secret coin count
 * @param {number} userCoins Your user coin count
 * @param {number} iconType Your selected icon type
 * @param {number} cubeID Your cube's ID
 * @param {number} shipID Your ship's ID
 * @param {number} ballID Your ball's ID
 * @param {number} ufoID Your UFO's ID
 * @param {number} waveID Your wave's ID
 * @param {number} robotID Your robot's ID
 * @param {number} spiderID Your spider's ID
 * @param {number} swingID Your swing's ID
 * @param {number} jetpackID Your jetpack's ID
 * @param {number} deathEffectID Your death effect ID
 * @param {number} color1 Your primary color
 * @param {number} color2 Your secondary color
 * @param {number} glowColor Your glow color. Will default to secondary if left out
 * @param {boolean} glow Whether glow is enabled
 * @param {Array[number]} completedDemons Array of all the IDs of your completed demons
 * @param {object} classic Amounts of completed classic levels
 * @param {number} classic.auto Amount of completed classic auto levels
 * @param {number} classic.easy Amount of completed classic easy levels
 * @param {number} classic.normal Amount of completed classic normal levels
 * @param {number} classic.hard Amount of completed classic hard levels
 * @param {number} classic.harder Amount of completed classic harder levels
 * @param {number} classic.insane Amount of completed classic insane levels
 * @param {object} platformer Amounts of completed platformer levels
 * @param {number} platformer.auto Amount of completed platformer auto levels
 * @param {number} platformer.easy Amount of completed platformer easy levels
 * @param {number} platformer.normal Amount of completed platformer normal levels
 * @param {number} platformer.hard Amount of completed platformer hard levels
 * @param {number} platformer.harder Amount of completed platformer harder levels
 * @param {number} platformer.insane Amount of completed platformer insane levels
 * @param {number} completedGauntletDemons Amount of completed gauntlet demons
 * @param {number} completedGauntletNonDemons Amount of completed gauntlet non-demons
 * @param {number} completedDailies Amount of completed dailies
 * @param {number} completedWeeklies Amount of completed weeklies
 * @returns {number}
 */
export interface UpdateUserOptions {
    stars: number;
    demons: number;
    moons: number;
    diamonds: number;
    secretCoins: number;
    userCoins: number;
    cubeID: number;
    shipID: number;
    ballID: number;
    ufoID: number;
    waveID: number;
    robotID: number;
    glow: boolean;
    spiderID: number;
    deathEffectID: number;
    swingID: number;
    jetpackID: number;
    color1: number;
    color2: number;
    glowColor: number;
    iconType: number;
    completedDemons: number[];
    completedWeeklies: number;
    completedGauntletDemons: number;
    completedGauntletNonDemons: number;
    completedDailies: number;
    classic: {
        auto: number;
        easy: number;
        normal: number;
        hard: number;
        harder: number;
        insane: number;
    };
    platformer: {
        auto: number;
        easy: number;
        normal: number;
        hard: number;
        harder: number;
        insane: number;
    };
}

export class UserClient extends RequestClient {
    public constructor(instance: Client) {
        super(instance);
    }

    public async searchUsers(username: string) {
        const data = await this.baseRequest('getUsers', { str: username });
        const segments = data.split('#');
        const users = segments[0].split('|').map((u) => parseUser(u, this.client));
        const pages = segments[1].split(':');

        return {
            users,
            total: Number(pages[0]),
            offset: Number(pages[1]),
            pageSize: Number(pages[2]),
        };
    }

    public async getUserByAccountID(accountID: number) {
        const data = await this.baseRequest('getUserInfo', {
            targetAccountID: accountID,
            ...this.client.auth,
        });

        return parseUser(data, this.client);
    }

    public async updateUserScore(opt: UpdateUserOptions) {
        if (!this.client.auth) throw new Error('Must authenticate with account');

        const demons = opt.demons || opt.completedDemons.length;
        const dinfo = opt.completedDemons.join(',');
        const sinfo = `${opt.classic.auto},${opt.classic.easy},${opt.classic.normal},${opt.classic.hard},${opt.classic.harder},${opt.classic.insane},${opt.platformer.auto},${opt.platformer.easy},${opt.platformer.normal},${opt.platformer.hard},${opt.platformer.harder},${opt.platformer.insane}`;
        let icon = opt.cubeID;
        switch (opt.iconType) {
            case 1:
                icon = opt.shipID;
                break;
            case 2:
                icon = opt.ballID;
                break;
            case 3:
                icon = opt.ufoID;
                break;
            case 4:
                icon = opt.waveID;
                break;
            case 5:
                icon = opt.robotID;
                break;
            case 6:
                icon = opt.spiderID;
                break;
            case 7:
                icon = opt.swingID;
                break;
            case 8:
                icon = opt.jetpackID;
                break;
        }

        const data = await this.baseRequest('updateUserScore', {
            ...this.client.auth,
            stars: opt.stars,
            demons,
            moons: opt.moons,
            diamonds: opt.diamonds,
            coins: opt.secretCoins,
            userCoins: opt.userCoins,
            icon,
            iconType: opt.iconType,
            accIcon: opt.cubeID,
            accShip: opt.shipID,
            accBall: opt.ballID,
            accBird: opt.ufoID,
            accDart: opt.waveID,
            accRobot: opt.robotID,
            accGlow: Number(opt.glow),
            accSpider: opt.spiderID,
            accExplosion: opt.deathEffectID,
            accSwing: opt.swingID,
            accJetpack: opt.jetpackID,
            color1: opt.color1,
            color2: opt.color2,
            color3: opt.glowColor || -1,
            special: opt.glow ? 2 : 0,
            dinfo,
            dinfow: opt.completedWeeklies,
            dinfog: opt.completedGauntletDemons,
            sinfo,
            sinfod: opt.completedDailies,
            sinfog: opt.completedGauntletNonDemons,
            seed: generateRandomString(10),
            // accountID, userCoins, demons, stars, coins, iconType, icon, diamonds, cube, ship, ball, ufo, wave, robot, glow, spider, deathEffect
            seed2: chk(
                [
                    this.client.auth.accountID,
                    opt.userCoins,
                    demons,
                    opt.stars,
                    opt.secretCoins,
                    opt.iconType,
                    icon,
                    opt.diamonds,
                    opt.cubeID,
                    opt.shipID,
                    opt.ballID,
                    opt.ufoID,
                    opt.waveID,
                    opt.robotID,
                    Number(opt.glow),
                    opt.spiderID,
                    opt.deathEffectID,
                    dinfo.length,
                    opt.completedWeeklies,
                    opt.completedGauntletDemons,
                    sinfo,
                    opt.completedDailies,
                    opt.completedGauntletNonDemons,
                ],
                KEYS.STAT_SUBMISSION,
                SALTS.STAT_SUBMISSION,
            ),
        });

        return Number(data);
    }

    public async updateAccountSettings({
        mS,
        frS,
        cS,
        youtube,
        twitch,
        twitter,
    }: {
        mS: string;
        frS: string;
        cS: string;
        youtube: string;
        twitch: string;
        twitter: string;
    }) {
        if (!this.client.auth) throw new Error('Must authenticate with account');
        const data = await this.accountRequest('updateAccountSettings', {
            ...this.client.auth,
            mS,
            frS,
            cS,
            yt: youtube,
            twitter,
            twitch,
        });

        return data;
    }
}
