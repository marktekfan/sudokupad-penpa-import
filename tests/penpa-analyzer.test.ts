import { expect, test } from 'vitest';
import { PenpaLoader } from '../src/penpa-loader/penpa-loader.ts';
import { PenpaAnalyzer } from '../src/penpa-analyzer.ts';
import { ConverterFlags } from '../src/converter-flags.ts';
// import { type PuInfo } from '../penpa-analyzer.ts';

// const empty6x6_square =
// 	'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VRRb5s8FH3nV0R+9gOQlLW8dV3zvaTZumSqKoQiJ3EaFMCdgbVylP/eey9IxEC/h0nT9lBZPjoc39iHcI+Ln5XQkgcwxpfc5R4MPwhoepMJTbcZy6RMZThayqIcBa8Bv67KvdLh6E7oA6iHncg5n6uRrlJZ8K/TKd+JtJBO1GwQO0dzFZp7bv4LI+YxznyYHou5uQ+P5i40C24WsMS4B9qsLvKB3rb0gdaR3dSi5wKfNxzoI9BNojepXM1q5VsYmSVneM5n+jVSlqlfkjU+8HmjsnWCwlqU8J7FPnluVopqqw5VU+vFJ26u37c7bu0ire0iG7CLb/GH7V7FpxP87d/B8CqM0PuPll62dBEeAeeEHuEj4ZTQJ1xCKTdjwi+ELuEF4YxqbgkfCG8IJ4QB1XzCw/41O5HvU9vX4+L3eexE0OKsUOmqqPRObOCDUQLgm4CWV9laaktKlXpOk9yuS55ypeXgEopy+zRUv1Z629n9RaSpJdRht6S69Syp1NBXZ89Ca/ViKZko95Zw1oPWTjIvbQOlsC2Kg+iclrXvfHLYK6MZjfFq+rhA/tYFgt/A/bhG/t8Ota/Sg9kHeSD+oA7GvNF7SQe9l2k8sB9rUAeSDWo33CD18w1iL+KgvZNy3LUbdHTVzToe1Ys7HnWe+Ch23gA=';
const sudoku6x6_square_nosol =
	'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VVPb5tOFLz7U1h73oP5szjhlqZJL4l/TeMqipAVrR2SWMYmXeCXCMvfPfMeJCyYqmqrqjlUiNUwPGbnLcySfSu0iWWAwzuQI+ngcIOAT8f3+RzVx3SZJ3E4nMZZPgyeA3lU5A+pCYfn2qzAru70RspJOjRFEmfyv9NTeaeTLB5EtcBssC0Pw/JClp/CSDhCChenI2ayvAi35XlYTmR5iVtCOuDOqiIX8KSBV3yf0HFFOiPgSY0BrwEXS7NI4puzivkcRuVUCprnAz9NUKzT/2NR+6DrRbqeL4mY6xx9Zg/Lx/pOVtymq6KudWY7WR5Vdi977HqNXYKVXUI9dqmLP2z3cLbbYdm/wPBNGJH3rw08aOBluMU4CbfCdelRBS/VuxFuQETQEJ5HhG8R6nVxXokxEV5D+CxqVfh+t4JnsUQVV+ALeSO4wtII2IdN8COWRsDGLOsBG7OaG7OGVTHmR940sCgOL801j6c8ujxOsXKy9Hj8yOOIR8XjGdecYEEdBzFyYc2Fogvs1djjeFWYokYdE1bA1ArhAHj8Wo9welhIxi4wvDP22pr0OhgrYCwaY8SZ3grrQ0fVOgo6qtZR0LE9qFpHQYcWnzF0FOmguStu8ZhHn8eAWx/TJ/VTH93vr/IP7UQuOn070NGv4tkgwkYmsjS5yQpzpxeIJe9zSB64TbGex6ZFJWn6mCw37brl/SY1ce8tIuPb+776eWpuO+pPOklaRLWlt6hqg2lRucHuYV1rY9KnFrPW+UOLsHaallK8ydsGct22qFe6M9u66Xk3EM+Cz8ijH9C/38Tf+k3QOxi9t9y+Nzv8+aamN/uge+IPtjfmNb+XdPB7maYJ92MNtifZYLvhBrWfb5B7EQf3nZSTajfo5KqbdZpqL+40lZ147KCMXgA=';

	
test('Load square 6x6 sudoku', () => {
	let pu = PenpaLoader.loadPenpaPuzzle(sudoku6x6_square_nosol)!;
	// (pu as any).point = undefined;
	// console.log(pu);
	expect(pu.gridtype).toBe('square');
	expect(pu.nx).toBe(6);
	expect(pu.ny).toBe(6);
	expect(pu.centerlist.length).toBe(36);
});

test.todo('unimplemented test')

test('Analyze 6x6 soduku with regions', () => {
	try {
		let pu = PenpaLoader.loadPenpaPuzzle(sudoku6x6_square_nosol)!;
		expect(pu.gridtype).toBe('square');
		expect(pu.nx).toBe(6);
		expect(pu.ny).toBe(6);
		expect(pu.centerlist.length).toBe(36);
	
		let { puinfo } = PenpaAnalyzer.preparePenpaPuzzle(pu, new ConverterFlags().getFlagValues());
		//console.log(puinfo);
		expect(puinfo.width).toBe(6);
		expect(puinfo.height).toBe(6);
		expect(puinfo.maskedCells.length).toBe(0);

		const { squares } = puinfo; //{ r: 0, c: 0, size: 6 }
		expect(Array.isArray(squares)).toBe(true);
		expect(squares.length).toBe(1);
		const sq = squares[0];
		expect(sq.size).toBe(6);
		expect(sq.r).toBe(0);
		expect(sq.c).toBe(0);
		expect(sq.size).toBe(6);

		// 6 regions with each containing 6 cells
		const { regions } = puinfo;
		expect(Array.isArray(regions)).toBe(true);
		expect(regions.length).toBe(6);
		expect(regions.every((reg: Array<number>) => reg.length === 6)).toBe(true);
	} catch (err) {
		console.log(err);
	}
});
