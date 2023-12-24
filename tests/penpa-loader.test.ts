import { expect, test } from 'vitest';
import { PenpaLoader } from '../src/penpa-loader/penpa-loader';
//import { type PenpaPuzzle } from '../src/penpa-loader/penpa-puzzle';

const triPuzzle =
	'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7ZRfb5swFMXf8ykiP3sSDvnT8NZ1zV7SbF2YqgqhyEmcBMXBnYG1osp3772XrMyB7m3THirE4fhngy/g49wmfIiHxz0u4Oj3PO6PBPcHPp3I8QiTXKugG6os74Y2kelWK35Z5Dtjg+6NtHvo2m9kyvnMdG2hVca/TCZ8I3WmOpEXd57LcVDe8vJzEDHBOOvBKVjMy9vgubwJyjkv59DFuAA2rQb1wF7X9o760V1VUHjgZycP9h7sKrErrRbTinwNojLkDOf5SHejZQfzU7FTHdhemcMyQaCTVD2dYFaszb44DRPxkZeXb1fq15WirSpF11IpvsDfq3QcH4/wsb9BrYsgwrK/1/aitvPgGXRGKkjvSSekPdIQhvLSJ/1E6pEOSKc05pr0jvSKtE86pDEjnOx/KycSI5+LwZB/EP0BrnqwAht4wWafrgBGFXhFBC9+QcC9Vw8d47oj7kSw5Flm9CIr7Eau4C9SFuBvAUuLw1JZB2ljHvCnOjDZpsaq1i6Ear1tG780dn329EeptQOyH4W07s3VenQQbA9OW1prHh1ykPnOAUuZw06R7ZIH90kqzd0CcumWKPfybLZD/c7HDntidEa4J0Gc3jeUf7mh4Jf33reVP5dDi9bY1sQDbgk90NZwn3gj38AbScYJm2EG2pJnoOeRBtRMNcBGsIG9kW186nm8sarzhONUjZDjVL/nPIo7Lw==';
const empty6x6_square =
	'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VRRb5s8FH3nV0R+9gOQlLW8dV3zvaTZumSqKoQiJ3EaFMCdgbVylP/eey9IxEC/h0nT9lBZPjoc39iHcI+Ln5XQkgcwxpfc5R4MPwhoepMJTbcZy6RMZThayqIcBa8Bv67KvdLh6E7oA6iHncg5n6uRrlJZ8K/TKd+JtJBO1GwQO0dzFZp7bv4LI+YxznyYHou5uQ+P5i40C24WsMS4B9qsLvKB3rb0gdaR3dSi5wKfNxzoI9BNojepXM1q5VsYmSVneM5n+jVSlqlfkjU+8HmjsnWCwlqU8J7FPnluVopqqw5VU+vFJ26u37c7bu0ire0iG7CLb/GH7V7FpxP87d/B8CqM0PuPll62dBEeAeeEHuEj4ZTQJ1xCKTdjwi+ELuEF4YxqbgkfCG8IJ4QB1XzCw/41O5HvU9vX4+L3eexE0OKsUOmqqPRObOCDUQLgm4CWV9laaktKlXpOk9yuS55ypeXgEopy+zRUv1Z629n9RaSpJdRht6S69Syp1NBXZ89Ca/ViKZko95Zw1oPWTjIvbQOlsC2Kg+iclrXvfHLYK6MZjfFq+rhA/tYFgt/A/bhG/t8Ota/Sg9kHeSD+oA7GvNF7SQe9l2k8sB9rUAeSDWo33CD18w1iL+KgvZNy3LUbdHTVzToe1Ys7HnWe+Ch23gA=';
const sudoku6x6_square_nosol =
	'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VVPb5tOFLz7U1h73oP5szjhlqZJL4l/TeMqipAVrR2SWMYmXeCXCMvfPfMeJCyYqmqrqjlUiNUwPGbnLcySfSu0iWWAwzuQI+ngcIOAT8f3+RzVx3SZJ3E4nMZZPgyeA3lU5A+pCYfn2qzAru70RspJOjRFEmfyv9NTeaeTLB5EtcBssC0Pw/JClp/CSDhCChenI2ayvAi35XlYTmR5iVtCOuDOqiIX8KSBV3yf0HFFOiPgSY0BrwEXS7NI4puzivkcRuVUCprnAz9NUKzT/2NR+6DrRbqeL4mY6xx9Zg/Lx/pOVtymq6KudWY7WR5Vdi977HqNXYKVXUI9dqmLP2z3cLbbYdm/wPBNGJH3rw08aOBluMU4CbfCdelRBS/VuxFuQETQEJ5HhG8R6nVxXokxEV5D+CxqVfh+t4JnsUQVV+ALeSO4wtII2IdN8COWRsDGLOsBG7OaG7OGVTHmR940sCgOL801j6c8ujxOsXKy9Hj8yOOIR8XjGdecYEEdBzFyYc2Fogvs1djjeFWYokYdE1bA1ArhAHj8Wo9welhIxi4wvDP22pr0OhgrYCwaY8SZ3grrQ0fVOgo6qtZR0LE9qFpHQYcWnzF0FOmguStu8ZhHn8eAWx/TJ/VTH93vr/IP7UQuOn070NGv4tkgwkYmsjS5yQpzpxeIJe9zSB64TbGex6ZFJWn6mCw37brl/SY1ce8tIuPb+776eWpuO+pPOklaRLWlt6hqg2lRucHuYV1rY9KnFrPW+UOLsHaallK8ydsGct22qFe6M9u66Xk3EM+Cz8ijH9C/38Tf+k3QOxi9t9y+Nzv8+aamN/uge+IPtjfmNb+XdPB7maYJ92MNtifZYLvhBrWfb5B7EQf3nZSTajfo5KqbdZpqL+40lZ147KCMXgA=';

const puzzlink_aho = 'https://puzz.link/p?aho/11/7/-14lch-15zw11v-16p';

test('Load empty 6x6 square', () => {
	let pu = PenpaLoader.loadPenpaPuzzle(empty6x6_square)!;
	// (pu as any).point = undefined;
	// console.log(pu);
	expect(pu.gridtype).toBe('square');
	expect(pu.nx).toBe(6);
	expect(pu.ny).toBe(6);
	expect(pu.centerlist.length).toBe(36);
});

test('Load square 6x6 sudoku', () => {
	let pu = PenpaLoader.loadPenpaPuzzle(sudoku6x6_square_nosol)!;
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
