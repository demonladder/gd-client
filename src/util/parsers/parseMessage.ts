import { robTopSplit, base64Decode, xor } from '..';
import { KEYS } from '../../constants';

const messageNumberKeys = {
    1: 'id',
    2: 'accountID',
    3: 'playerID',
} as const;
const messageStringKeys = {
    4: 'title',
    5: 'content',
    6: 'username',
    7: 'age',
} as const;
const messageBoolKeys = {
    8: 'read',
    9: 'outgoing',
} as const;

export interface Message
    extends
        Record<(typeof messageNumberKeys)[keyof typeof messageNumberKeys], number | undefined>,
        Record<(typeof messageStringKeys)[keyof typeof messageStringKeys], string | undefined>,
        Record<(typeof messageBoolKeys)[keyof typeof messageBoolKeys], boolean | undefined> {}

export function parseMessage(str: string): Message {
    const message: Partial<Message> = {};
    const raw = robTopSplit(str, ':');

    for (const i of Object.entries(messageNumberKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = Number(raw.get(i[0].toString())) || 0;
    }
    for (const i of Object.entries(messageStringKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) ?? '';
    }
    for (const i of Object.entries(messageBoolKeys)) {
        if (raw.get(i[0].toString()) != undefined && raw.get(i[0].toString()) != null)
            message[i[1]] = raw.get(i[0].toString()) ? !!Number(raw.get(i[0].toString())) : false;
    }
    if (raw.get('4')) message.title = base64Decode(raw.get('4')!);
    if (raw.get('5')) message.content = xor(base64Decode(raw.get('5')!), KEYS.MESSAGES);

    // for (const i of raw.keys()) {
    //     if (!messageBoolKeys[i] && !messageStringKeys[i] && !messageNumberKeys[i]) {
    //         message[`unk_${i}`] = raw.get(i);
    //     }
    // }
    return message as Message;
}
