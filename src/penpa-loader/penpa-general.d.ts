import type { PenpaPuzzle } from './penpa-puzzle';
import type { FakeDoc } from './fakedoc';

export function PenpaGeneral(fakedoc: FakeDoc): {
	decode_puzzlink: (...args: any[]) => PenpaPuzzle;
	load: (...args: any[]) => PenpaPuzzle;
	create: (...args: any[]) => PenpaPuzzle;
};
