import { describe, expect, test } from 'vitest';
import { PenpaLoader } from '../src/penpa-loader/penpa-loader';

import { triPuzzle } from './test-puzzles.ts';
import { square6x6_empty } from './test-puzzles.ts';
import { puzzlink_aho } from './test-puzzles.ts';
import { square6x6_sudoku_nosol } from './test-puzzles.ts';

describe('Penpa Loader', () => {
	test('Load empty 6x6 square', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(square6x6_empty)!;
		// (pu as any).point = undefined;
		// console.log(pu);
		expect(pu.gridtype).toBe('square');
		expect(pu.nx).toBe(6);
		expect(pu.ny).toBe(6);
		expect(pu.centerlist.length).toBe(36);
	});

	test('Load square 6x6 sudoku', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(square6x6_sudoku_nosol)!;
		// (pu as any).point = undefined;
		// console.log(pu);
		expect(pu.gridtype).toBe('square');
		expect(pu.nx).toBe(6);
		expect(pu.ny).toBe(6);
		expect(pu.centerlist.length).toBe(36);
	});

	test('Unsupported puzzle type', () => {
		// throw new ConverterError("Penpa grid type 'tri' is not supported in SudokuPad")
		expect(() => PenpaLoader.loadPenpaPuzzle(triPuzzle)).toThrowError(/'tri' is not supported/);
	});

	test('Load puzz.link 11x7 aho', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(puzzlink_aho)!;
		// (pu as any).point = undefined;
		// console.log(pu);
		expect(pu.gridtype).toBe('square');
		expect(pu.user_tags.includes('aho')).toBe(true);
		expect(pu.nx).toBe(11);
		expect(pu.ny).toBe(7);
		expect(pu.centerlist.length).toBe(77);
	});
});
