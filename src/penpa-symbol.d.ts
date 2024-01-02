import { type PuInfo } from './penpa-postprocess';
import { type SclPuzzle } from './sclpuzzle';
import { type Ctx } from './penpa-drawingcontext';

export class PenpaSymbol {
	constructor(puinfo: PuInfo, puzzle: SclPuzzle, size: number, decoder: object);
	draw_number(ctx: Ctx, number: unknown[], key: string);
	draw_numberS(ctx: Ctx, number: unknown[], key: string);

	draw_symbol(ctx: Ctx, x: number, y: number, num: number, sym: string, cc?: string);
}
