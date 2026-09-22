import { Base } from '../Base';
import { Client } from '../Client';
import { base64Decode, robTopSplit } from '../util';

const postKeyMap = {
    content: '2',
    likes: '4',
    ID: '6',
    age: '9',
} as const;

export class Post extends Base {
    public readonly ID: number;
    public readonly content: string;
    public readonly likes: number;
    public readonly age: string;

    public constructor(client: Client, str: string) {
        super(client);

        const data = robTopSplit(str, '~');
        this.ID = data.getIntOrThrow(postKeyMap.ID);
        if (!data.has(postKeyMap.content)) throw new Error('Parsing error: Post content is missing.');
        this.content = base64Decode(data.get(postKeyMap.content)!);
        this.likes = data.getIntOrThrow(postKeyMap.likes);
        if (!data.has(postKeyMap.age)) throw new Error('Parsing error: Post age is missing.');
        this.age = data.get(postKeyMap.age)!;
    }

    public toJSON() {
        return {};
    }
}
