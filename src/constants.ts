export const SECRETS = {
    COMMON: 'Wmfd2893gb7',
    ACCOUNT: 'Wmfv3899gc9',
    DELETE: 'Wmfv2898gc9',
    MOD: 'Wmfp3879gc3',
    ADMIN: 'Wmfx2878gb9',
};

export const LIBRARY_SECRET = '8501f9c2-75ba-4230-8188-51037c4da102';

export const KEYS = {
    SAVE_DATA: '\x0B',
    MESSAGES: '14251',
    VAULT_CODES: '19283',
    CHALLENGES: '19847',
    LEVEL_PASSWORD: '26364',
    COMMENT: '29481',
    ACCOUNT_PASSWORD: '37526',
    LEVEL_LEADERBOARD: '39673',
    LEVEL: '41274',
    LOAD_DATA: '48291',
    RATE: '58281',
    CHEST_REWARDS: '59182',
    STAT_SUBMISSION: '85271',
};

export const LENGTHS = {
    0: 'TINY',
    1: 'SHORT',
    2: 'MEDIUM',
    3: 'LONG',
    4: 'XL',
    5: 'PLATFORMER',
    TINY: 0,
    SHORT: 1,
    MEDIUM: 2,
    LONG: 3,
    XL: 4,
    PLATFORMER: 5,
};

export const ICON_TYPES = {
    0: 'CUBE',
    1: 'SHIP',
    2: 'BALL',
    3: 'UFO',
    4: 'WAVE',
    5: 'ROBOT',
    6: 'SPIDER',
    7: 'SWING',
    8: 'JETPACK',
    CUBE: 0,
    ICON: 0,
    SHIP: 1,
    BALL: 2,
    BIRD: 3,
    UFO: 3,
    WAVE: 4,
    DART: 4,
    ROBOT: 5,
    SPIDER: 6,
    SWING: 7,
    SWINGCOPTER: 7,
    JETPACK: 8,
};

export const LISTS_HASH = 'f5da5823d94bbe7208dd83a30ff427c7d88fdb99'; // sha-1 of xI25fpAapCQg (SALTS.LEVEL)

export const SALTS = {
    LEVEL: 'xI25fpAapCQg',
    COMMENT: 'xPT6iUrtws0J',
    GJP2: 'mI29fmAnxgTs',
    STAT_SUBMISSION: 'xI35fsAapCRg',
    LIKE_OR_RATE: 'ysg6pUrtjn0J',
    LEVEL_LEADERBOARDS: 'yPg6pUrtWn0J',
    REWARDS: 'pC26fpYaQCtg',
    CHALLENGES: 'oC36fpYaPtdg',
};

export enum DefaultEndpoints {
    getLevels = 'getGJLevels21.php',
    getDailyLevel = 'getGJDailyLevel.php',
    getMapPacks = 'getGJMapPacks21.php',
    getGauntlets = 'getGJGauntlets21.php',
    downloadLevel = 'downloadGJLevel22.php',
    reportLevel = 'reportGJLevel.php',
    getUsers = 'getGJUsers20.php',
    getUserInfo = 'getGJUserInfo20.php',
    getAccountComments = 'getGJAccountComments20.php',
    getComments = 'getGJComments21.php',
    registerAccount = 'accounts/registerGJAccount.php',
    loginAccount = 'accounts/loginGJAccount.php',
    getCommentHistory = 'getGJCommentHistory.php',
    getSongInfo = 'getGJSongInfo.php',
    updateUserScore = 'updateGJUserScore22.php',
    getRewards = 'getGJRewards.php',
    requestModAccess = 'requestUserAccess.php',
    getLeaderboards = 'getGJScores20.php',
    uploadAccountComment = 'uploadGJAccComment20.php',
    deleteAccountComment = 'deleteGJAccComment20.php',
    uploadComment = 'uploadGJComment21.php',
    deleteComment = 'deleteGJComment20.php',
    getTopArtists = 'getGJTopArtists.php',
    getLists = 'getGJLevelLists.php',
    likeItem = 'likeGJItem211.php',
    rateLevel = 'rateGJStars211.php',
    rateDemon = 'rateGJDemon21.php',
    updateDescription = 'updateGJDesc20.php',
    uploadLevel = 'uploadGJLevel21.php',
    deleteLevel = 'deleteGJLevelUser20.php',
    getUserList = 'getGJUserList20.php',
    loadSaveData = 'accounts/syncGJAccountNew.php',
    updateAccountSettings = 'updateGJAccSettings20.php',
    getMessages = 'getGJMessages20.php',
    readMessage = 'downloadGJMessage20.php',
    sendMessage = 'uploadGJMessage20.php',
    deleteMessage = 'deleteGJMessages20.php',
    blockUser = 'blockGJUser20.php',
    unblockUser = 'unblockGJUser20.php',
    deleteFriendRequests = 'deleteGJFriendRequests20.php',
    sendFriendRequest = 'uploadFriendRequest20.php',
    getFriendRequests = 'getGJFriendRequests20.php',
    readFriendRequest = 'readGJFriendRequest20.php',
    acceptFriendRequest = 'acceptGJFriendRequest20.php',
    removeFriend = 'removeGJFriend20.php',
    uploadList = 'uploadGJLevelList.php',
    deleteList = 'deleteGJLevelList.php',
    getAccountURL = 'getAccountURL.php',
    getLevelLeaderboards = 'getGJLevelScores211.php',
    getPlatformerLevelLeaderboards = 'getGJLevelScoresPlat.php',
    backupSaveData = 'backupGJAccountNew.php',
    getContentURL = 'getCustomContentURL.php',
    musicLibraryVersion = 'music/musiclibrary_version_02.txt',
    musicLibraryVersionOld = 'music/musiclibrary_version.txt',
    sfxLibraryVersion = 'sfx/sfxlibrary_version.txt',
    musicLibrary = 'music/musiclibrary_02.dat',
    musicLibraryOld = 'music/musiclibrary.dat',
    sfxLibrary = 'sfx/sfxlibrary.dat',
    getChallenges = 'getGJChallenges.php',
}

export const VERSIONLESS_ENDPOINTS = ['registerAccount'];

export const DEFAULT_HEADERS_22 = {
    'User-Agent': '',
    Accept: '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: 'gd=1;',
    Host: 'www.boomlings.com',
};

export const DEFAULT_HEADERS_21 = {
    'User-Agent': '',
    Accept: '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
};

export const RS_CHARACTERS = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890'.split('');

export const HEX_CHARACTERS = 'abcdef1234567890'.split('');

export const DEFAULT_SERVER = 'https://www.boomlings.com/database';
export const DEFAULT_SERVER_21 = 'http://www.boomlings.com/database';
export const DEFAULT_ACCOUNT_URL = 'https://www.robtopgames.org/database';
export const DEFAULT_CONTENT_URL = 'https://geometrydashfiles.b-cdn.net';

export const ITEMS = {
    FIRE: 1,
    ICE: 2,
    POISON: 3,
    SHADOW: 4,
    LAVA: 5,
    KEY: 6,
    EARTH: 10,
    BLOOD: 11,
    METAL: 12,
    LIGHT: 13,
    SOUL: 14,
};
