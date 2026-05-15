import type { Client } from '../../Client';
import { User } from '../../structures';
import { robTopSplit, base64Decode } from '..';
import { parseIntAssert, parseIntUndefined } from '.';
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
        parseIntAssert(raw.get('16')), // accountID
        parseIntAssert(raw.get('2')), // playerID
        parseIntAssert(raw.get('9')), // iconID
        parseIntAssert(raw.get('10')), // color1
        parseIntAssert(raw.get('11')), // color2
        parseIntAssert(raw.get('13')), // secretCoins
        parseIntAssert(raw.get('17')), // userCoins
        parseIntAssert(raw.get('3')), // stars
        parseIntAssert(raw.get('52')), // moons
        parseIntAssert(raw.get('46')), // diamonds
        parseIntAssert(raw.get('4')), // demons
        parseIntAssert(raw.get('14')), // iconType
        parseIntAssert(raw.get('15')), // special
        parseIntAssert(raw.get('18')), // messagePermissions
        parseIntAssert(raw.get('19')), // friendPermissions
        parseIntAssert(raw.get('21')), // cube
        parseIntAssert(raw.get('22')), // ship
        parseIntAssert(raw.get('23')), // ball
        parseIntAssert(raw.get('24')), // ufo
        parseIntAssert(raw.get('25')), // wave
        parseIntAssert(raw.get('26')), // robot
        parseIntAssert(raw.get('53')), // swing
        parseIntAssert(raw.get('54')), // jetpack
        parseIntAssert(raw.get('27')), // trail
        parseIntAssert(raw.get('28')), // glow
        parseIntAssert(raw.get('30')), // globalRank
        parseIntAssert(raw.get('31')), // friendState
        parseIntAssert(raw.get('32')), // friendRequestID
        parseIntAssert(raw.get('38')), // messages
        parseIntAssert(raw.get('39')), // friendRequests
        parseIntAssert(raw.get('40')), // newFriends
        parseIntAssert(raw.get('43')), // spider
        parseIntAssert(raw.get('48')), // deathEffect
        parseIntAssert(raw.get('49')), // modLevel
        parseIntAssert(raw.get('50')), // commentHistoryPermissions
        parseIntUndefined(raw.get('7')), // accountHighlight
        parseIntUndefined(raw.get('51')), // color3
        raw.has('35') ? base64Decode(raw.get('35')!) : undefined, // comment
        parseIntUndefined(raw.get('8')), // creatorPoints
        demonCounts,
        levelCounts,
        parseIntUndefined(raw.get('6')),
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
