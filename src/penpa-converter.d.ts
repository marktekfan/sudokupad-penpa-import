import type { PenpaPuzzle } from "./penpa-loader/penpa-puzzle";
import type { Ctx } from "./penpa-drawingcontext";

export class PenpaConverter {
    static settings: Dictionary;
    static flags: Dictionary;
    static ParseUrlSettings(): void;
    static isDoubleLayer: (ctx: Ctx) => boolean;
    static isPenpaUrl: (url: string) => any;
    static loadPenpaPuzzle: (urlstring: string) => PenpaPuzzle;
    static convertPenpaPuzzle: (pu: PenpaPuzzle | string | null) => {
        id: string;
        settings: Dictionary;
    };
}
