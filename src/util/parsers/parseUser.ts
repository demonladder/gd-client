import type { Client } from '../../Client';
import { User } from '../../structures';
import { robTopSplit, base64Decode } from '..';
import { parseIntUndefined } from './parseIntUndefined';
import type { TinyUser } from '../../types/TinyUser';

export function parseUser(str: string, client: Client, sep = ':'): User {
    const raw = robTopSplit(str, sep);

    let demonCounts: User['demonCounts'] = undefined;
    if (raw.has('55')) {
        const dc = raw.get('55')!.split(',');
        demonCounts = {
            classic: {
                easy: Number(dc[0]),
                medium: Number(dc[1]),
                hard: Number(dc[2]),
                insane: Number(dc[3]),
                extreme: Number(dc[4]),
            },
            platformer: {
                easy: Number(dc[5]),
                medium: Number(dc[6]),
                hard: Number(dc[7]),
                insane: Number(dc[8]),
                extreme: Number(dc[9]),
            },
            weekly: Number(dc[10]),
            gauntlet: Number(dc[11]),
        };
    }

    let levelCounts: User['levelCounts'] = undefined;
    if (raw.has('56')) {
        const lc = raw.get('56')!.split(',').map(Number);
        levelCounts = {
            classic: {
                auto: lc[0],
                easy: lc[1],
                normal: lc[2],
                hard: lc[3],
                harder: lc[4],
                insane: lc[5],
            },
            daily: lc[6],
            gauntlet: lc[7],
        };
    }
    if (raw.has('57')) {
        const lcP = raw.get('57')!.split(',').map(Number);
        levelCounts ??= {};
        levelCounts.platformer = {
            auto: lcP[0],
            easy: lcP[1],
            normal: lcP[2],
            hard: lcP[3],
            harder: lcP[4],
            insane: lcP[5],
        };
    }

    return new User(
        client,
        raw.getIntOrThrow('16'), // accountID
        raw.getIntOrThrow('2'), // playerID
        raw.getIntOrThrow('9'), // iconID
        raw.getIntOrThrow('10'), // color1
        raw.getIntOrThrow('11'), // color2
        raw.getIntOrThrow('13'), // secretCoins
        raw.getIntOrThrow('17'), // userCoins
        raw.getIntOrThrow('3'), // stars
        raw.getIntOrThrow('52'), // moons
        raw.getIntOrThrow('46'), // diamonds
        raw.getIntOrThrow('4'), // demons
        raw.getIntOrThrow('14'), // iconType
        raw.getIntOrThrow('15'), // special
        raw.getIntOrThrow('18'), // messagePermissions
        raw.getIntOrThrow('19'), // friendPermissions
        raw.getIntOrThrow('21'), // cube
        raw.getIntOrThrow('22'), // ship
        raw.getIntOrThrow('23'), // ball
        raw.getIntOrThrow('24'), // ufo
        raw.getIntOrThrow('25'), // wave
        raw.getIntOrThrow('26'), // robot
        raw.getIntOrThrow('53'), // swing
        raw.getIntOrThrow('54'), // jetpack
        raw.getIntOrThrow('27'), // trail
        raw.getIntOrThrow('28'), // glow
        raw.getIntOrThrow('30'), // globalRank
        raw.getIntOrThrow('31'), // friendState
        raw.getIntOrThrow('32'), // friendRequestID
        raw.getIntOrThrow('38'), // messages
        raw.getIntOrThrow('39'), // friendRequests
        raw.getIntOrThrow('40'), // newFriends
        raw.getIntOrThrow('43'), // spider
        raw.getIntOrThrow('48'), // deathEffect
        raw.getIntOrThrow('49'), // modLevel
        raw.getIntOrThrow('50'), // commentHistoryPermissions
        raw.getInt('7'), // accountHighlight
        raw.getInt('51'), // color3
        raw.has('35') ? base64Decode(raw.get('35')!) : undefined, // comment
        raw.getInt('8'), // creatorPoints
        demonCounts,
        levelCounts,
        raw.getInt('6'),
    );
}

export function parseUsers(str: string) {
    const raw = str.split('|');
    const users: TinyUser[] = [];

    for (const i of raw) {
        const user = i.split(':');
        users.push({
            username: user[1],
            playerID: Number(user[0]),
            accountID: parseIntUndefined(user[2]),
        });
    }

    return users;
}
