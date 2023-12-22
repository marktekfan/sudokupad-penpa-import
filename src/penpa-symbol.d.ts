import type { PenpaPuzzle } from './penpa-loader/penpa-puzzle';
import type { Ctx } from './penpa-drawingcontext';

export class PenpaSymbol {
	constructor(pu: PenpaPuzzle, puzzle: SclPuzzle, size: number, decoder: object);
	draw_number(ctx: Ctx, number: unknown[], key: string);
	draw_numberS(ctx: Ctx, number: unknown[], key: string);

    draw_symbol(ctx: Ctx, x: number, y: number, num: number, sym: string, cc?: string);
}
