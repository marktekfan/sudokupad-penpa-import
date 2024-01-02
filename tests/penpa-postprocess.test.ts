import { describe, expect, test } from 'vitest';
import { PenpaLoader } from '../src/penpa-loader/penpa-loader.ts';
import { PenpaPostProcess } from '../src/penpa-postprocess.ts';
import { ConverterFlags } from '../src/converter-flags.ts';

import { square6x6_solvable_sudoku_nosol } from './test-puzzles.ts';
import { sudoku4x4_outside_empty } from './test-puzzles.ts';
import { sudoku4x4_outside_features_on_all_sides } from './test-puzzles.ts';
import { sudoku4x4_outside_cosmetics_on_all_sides } from './test-puzzles.ts';

describe('Penpa Post Process', () => {
	test('Load square 6x6 sudoku', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(square6x6_solvable_sudoku_nosol)!;
		expect(pu).toMatchObject({
			gridtype: 'square',
			nx: 6,
			ny: 6,
		});
		expect(pu.centerlist.length).toBe(36);
	});

	test('6x6 sudoku to convert to 6x6 cells with 6x6 regions', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(square6x6_solvable_sudoku_nosol)!;
		expect(pu).toMatchObject({
			gridtype: 'square',
			nx: 6,
			ny: 6,
		});
		expect(pu.centerlist.length).toBe(36);

		let { puinfo } = PenpaPostProcess.postProcessPenpaPuzzle(pu, new ConverterFlags().getFlagValues());

		// 6x6 cell grid and 4x4 square at (1,1)
		expect(puinfo).toMatchObject({
			width: 6,
			height: 6,
			squares: [
				{
					size: 6,
					r: 0,
					c: 0,
				},
			],
		});

		// 6x6 regions
		expect(puinfo.regions.length).toBe(6);
		expect(puinfo.regions.every((reg: Array<number>) => reg.length === 6)).toBe(true);
	});

	test('4x4 sudoku with empty outside cells to convert to 4x4 cells with 4x4 regions', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(sudoku4x4_outside_empty)!;
		// (pu as any).point = null;
		// (pu as any).document = null;
		// (pu as any)._document = null;

		expect(pu).toMatchObject({
			gridtype: 'sudoku',
			nx: 6,
			ny: 6,
		});
		expect(pu.centerlist.length).toBe(16); // 4x4
		expect(pu.centerlist[0]).toBe((2 + 1) * pu.nx0 + (2 + 1)); // top-left cell is (1,1)
		expect(pu.centerlist[15]).toBe((2 + 4) * pu.nx0 + (2 + 4)); // bottom-right cell is (4,4)

		var flags = new ConverterFlags().getFlagValuesUnsafe();
		flags.expandGrid = false;
		let { puinfo } = PenpaPostProcess.postProcessPenpaPuzzle(pu, flags);
		(puinfo as any).pu = null;
		(puinfo as any).originalPu = null;
		(puinfo as any).point = null;

		// 4x4 cell grid and 4x4 square at (1,1)
		expect(puinfo).toMatchObject({
			width: 4,
			height: 4,
			squares: [
				{
					size: 4,
					r: 1,
					c: 1,
				},
			],
		});

		// 4x4 regions
		expect(puinfo.regions.length).toBe(4);
		expect(puinfo.regions[0].length).toBe(4);
	});

	test('4x4 sudoku with outside features to convert to 6x6 cells with 4x4 regions', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(sudoku4x4_outside_features_on_all_sides)!;
		// (pu as any).point = null;
		// (pu as any).document = null;
		// (pu as any)._document = null;

		expect(pu).toMatchObject({
			gridtype: 'sudoku',
			nx: 6,
			ny: 6,
		});
		expect(pu.centerlist.length).toBe(16); // 4x4
		expect(pu.centerlist[0]).toBe((2 + 1) * pu.nx0 + (2 + 1)); // top-left cell is (1,1)
		expect(pu.centerlist[15]).toBe((2 + 4) * pu.nx0 + (2 + 4)); // bottom-right cell is (4,4)

		var flags = new ConverterFlags().getFlagValuesUnsafe();
		flags.expandGrid = false;
		let { puinfo } = PenpaPostProcess.postProcessPenpaPuzzle(pu, flags);

		// const centerlist = puinfo.pu.centerlist;
		// console.log(centerlist);
		// (puinfo as any).pu = null;
		// (puinfo as any).originalPu = null;
		// (puinfo as any).point = null;

		// 6x6 cell grid and 4x4 square at (1,1)
		expect(puinfo).toMatchObject({
			width: 6,
			height: 6,
			squares: [
				{
					size: 4,
					r: 1,
					c: 1,
				},
			],
		});

		// 4x4 regions
		expect(puinfo.regions.length).toBe(4);
		expect(puinfo.regions[0].length).toBe(4);
	});

	test('4x4 sudoku with outside cosmetics and expandGrid=false to convert to 4x4 cells with 4x4 regions', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(sudoku4x4_outside_cosmetics_on_all_sides)!;
		// (pu as any).point = null;
		// (pu as any).document = null;
		// (pu as any)._document = null;

		expect(pu).toMatchObject({
			gridtype: 'sudoku',
			nx: 6,
			ny: 6,
		});
		expect(pu.centerlist.length).toBe(16); // 4x4
		expect(pu.centerlist[0]).toBe((2 + 1) * pu.nx0 + (2 + 1)); // top-left cell is (1,1)
		expect(pu.centerlist[15]).toBe((2 + 4) * pu.nx0 + (2 + 4)); // bottom-right cell is (4,4)

		var flags = new ConverterFlags().getFlagValuesUnsafe();
		// Set expandGrid = false
		flags.expandGrid = false;
		let { puinfo } = PenpaPostProcess.postProcessPenpaPuzzle(pu, flags);

		// const centerlist = puinfo.pu.centerlist;
		// console.log(centerlist);
		// (puinfo as any).pu = null;
		// (puinfo as any).originalPu = null;
		// (puinfo as any).point = null;

		// 4x4 cell grid and 4x4 square at (1,1)
		expect(puinfo).toMatchObject({
			width: 4,
			height: 4,
			squares: [
				{
					size: 4,
					r: 1,
					c: 1,
				},
			],
		});

		// 4x4 regions
		expect(puinfo.regions.length).toBe(4);
		expect(puinfo.regions[0].length).toBe(4);
	});

	test('4x4 sudoku with outside cosmetics and expandGrid=true to convert to 6x6 cells with 4x4 regions', () => {
		let pu = PenpaLoader.loadPenpaPuzzle(sudoku4x4_outside_cosmetics_on_all_sides)!;
		// (pu as any).point = null;
		// (pu as any).document = null;
		// (pu as any)._document = null;

		expect(pu).toMatchObject({
			gridtype: 'sudoku',
			nx: 6,
			ny: 6,
			centerlist: expect.arrayContaining([33]),
		});
		expect(pu.centerlist.length).toBe(16); // 4x4
		expect(pu.centerlist[0]).toBe((2 + 1) * pu.nx0 + (2 + 1)); // top-left cell is (1,1)
		expect(pu.centerlist[15]).toBe((2 + 4) * pu.nx0 + (2 + 4)); // bottom-right cell is (4,4)

		var flags = new ConverterFlags().getFlagValuesUnsafe();
		// Set expandGrid = true
		flags.expandGrid = true;
		let { puinfo } = PenpaPostProcess.postProcessPenpaPuzzle(pu, flags);

		// const centerlist = puinfo.pu.centerlist;
		// console.log(centerlist);
		// (puinfo as any).pu = null;
		// (puinfo as any).originalPu = null;
		// (puinfo as any).point = null;

		// 6x6 cell grid and 4x4 square at (1,1)
		expect(puinfo).toMatchObject({
			width: 6,
			height: 6,
			squares: [
				{
					size: 4,
					r: 1,
					c: 1,
				},
			],
		});

		// 4x4 regions
		expect(puinfo.regions.length).toBe(4);
		expect(puinfo.regions[0].length).toBe(4);
	});
});
