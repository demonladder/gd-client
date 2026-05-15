export interface MapPack {
    id: number;
    levels?: number[];
    stars: number;
    coins: number;
    name?: string;
    difficulty?: number;
    textColor?: { r: number; g: number; b: number };
    barColor?: { r: number; g: number; b: number };
}
