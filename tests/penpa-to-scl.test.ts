import { describe, expect, test } from 'vitest';
import { ConverterFlags } from '../src/converter-flags.ts';
import { PenpaToSclConverter } from '../src/penpa-to-scl.ts';

import { square6x6_solvable_sudoku_nosol } from './test-puzzles.ts';
import { sudoku4x4_outside_features_on_all_sides } from './test-puzzles.ts';

/*
TODO: to simplify matching check this link:
https://medium.com/@joelmalone/a-custom-deep-partial-match-on-any-item-in-an-array-matcher-for-jest-f77caaf49d33
*/

describe('Penpa to SCL converter', () => {

	test('6x6 sudoku to convert to 6x6 cells with 6x6 regions', () => {
		var flags = new ConverterFlags().getFlagValuesUnsafe();

		expect(flags.removeFrame).toBe(true); // ensure default value

		const scl = new PenpaToSclConverter(flags).convertPenpaToScl(square6x6_solvable_sudoku_nosol)!;
		expect(scl).toMatchObject({
			id: expect.stringMatching(/^penpa/),
		});
		expect(scl.cells.length).toBe(6);
		expect(scl.cells[0].length).toBe(6);
		expect(scl.cells[0]).toEqual(expect.arrayContaining([expect.objectContaining({ value: '5' })]));

		expect(scl.regions!.length).toBe(6);
		expect(scl.regions!.every((reg: Array<RC>) => reg.length === 6)).toBe(true);

		expect(scl.lines?.length ?? 0).toBe(0); // Frame lines must be removed

		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^title\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^author\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^rules\w*:/i) })]));
		expect(scl.cages!).not.toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^solution\w*:/i) })]));
	});

	test('6x6 sudoku to convert with removeFrame=false to 6x6 cells with 6x6 regions', () => {
		var flags = new ConverterFlags().getFlagValuesUnsafe();

		flags.removeFrame = false;
		flags.debug = true;

		const scl = new PenpaToSclConverter(flags).convertPenpaToScl(square6x6_solvable_sudoku_nosol)!;
		expect(scl).toMatchObject({
			id: expect.stringMatching(/^penpa/),
		});
		expect(scl.cells.length).toBe(6);
		expect(scl.cells[0].length).toBe(6);
		expect(scl.cells[0]).toEqual(expect.arrayContaining([expect.objectContaining({ value: '5' })]));

		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^frame/i) })])); // Frame lines must be present

		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^title\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^author\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^rules\w*:/i) })]));
		expect(scl.cages!).not.toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^solution\w*:/i) })]));
	});

	test('4x4 sudoku with outside features to convert to SP 6x6 cells with 4x4 regions', () => {
		var flags = new ConverterFlags().getFlagValuesUnsafe();

		flags.debug = true;
		expect(flags.removeFrame).toBe(true); // ensure default value

		const scl = new PenpaToSclConverter(flags).convertPenpaToScl(sudoku4x4_outside_features_on_all_sides)!;
		expect(scl).toMatchObject({
			id: expect.stringMatching(/^penpa/),
		});
		expect(scl.cells.length).toBe(6);
		expect(scl.cells[0].length).toBe(6);

		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^deletelineE/i) })])); // hidden gridlines
		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^frame/i) })])); // Frame lines must be present because of hidden gridlines

		expect(scl.underlays).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^thermo/i) })])); // thermo bulb
		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^thermo/i) })])); // thermo line
		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^line/i) })])); // feature line
		expect(scl.lines).toEqual(expect.arrayContaining([expect.objectContaining({ penpa: expect.stringMatching(/^cage/i) })])); // explicit cage line
		expect(scl.cages!).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					penpa: expect.stringMatching(/^killer/i),
					cells: [
						[3, 4],
						[3, 5],
					],
				}),
			])
		);

		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^title\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^author\w*:/i) })]));
		expect(scl.cages!).toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^rules\w*:/i) })]));
		expect(scl.cages!).not.toEqual(expect.arrayContaining([expect.objectContaining({ value: expect.stringMatching(/^solution\w*:/i) })]));
	});
});
