import { PuInfo } from './penpa-analyzer';
import { PenpaPuzzle } from './penpa-loader/penpa-puzzle';
import { PenpaTools } from './penpa-tools';

export function getSolutionInfo(puinfo: PuInfo) {
	const { pu, penpaTools } = puinfo;
	const { point2matrix } = penpaTools;
	let solutionPoints = [] as number[];
	['surface'].forEach(constraint => {
		let solution = getPuSolution(pu, constraint) || [];
		solution.forEach(s => {
			let point = s;
			solutionPoints.push(Number(point));
		});
	});
	['loopline'].forEach(constraint => {
		let solution = getPuSolution(pu, constraint) || [];
		solution.forEach(s => {
			let [p1, p2, _val] = s.split(',');
			[p1, p2].forEach(point => {
				solutionPoints.push(Number(point));
			});
		});
	});
	['number'].forEach(constraint => {
		let solution = getPuSolution(pu, constraint) || [];
		solution.forEach(s => {
			let [point, _val = '?'] = s.split(',');
			solutionPoints.push(Number(point));
		});
	});

	let uniqueRowsCols = false;
	if (solutionPoints.length !== 0) {
		const { top, left, height, width } = PenpaTools.getBoundsRC(solutionPoints, point2matrix);

		let sol = Array(height * width).fill('?');
		['number'].forEach(constraint => {
			let solution = getPuSolution(pu, constraint) || [];
			solution.forEach(s => {
				let [point, val = '?'] = s.split(',');
				let [r, c] = point2matrix(point);
				let pos = (r - top) * width + (c - left);
				if (pos >= 0 && pos < sol.length) {
					sol[pos] = val;
				}
			});
		});

		let set = new Set();
		(() => {
			// Check rows
			for (let r = 0; r < height; r++) {
				set.clear();
				for (let c = 0; c < width; c++) {
					let n = sol[r * width + c];
					if (!['?', '.'].includes(n)) {
						if (set.has(n)) {
							uniqueRowsCols = false;
							return;
						}
						set.add(n);
						uniqueRowsCols = true;
					}
				}
			}
			// Check columns
			for (let c = 0; c < width; c++) {
				set.clear();
				for (let r = 0; r < height; r++) {
					let n = sol[r * width + c];
					if (!['?', '.'].includes(n)) {
						if (set.has(n)) {
							uniqueRowsCols = false;
							return;
						}
						set.add(n);
						uniqueRowsCols = true;
					}
				}
			}
		})();
	}
	return { solutionPoints, uniqueRowsCols };
}

export function getPuSolution(pu: PenpaPuzzle, constraint = 'number'): string[] {
	let solution: string[] = [];
	if (!pu.solution) return solution;
	if (!pu.multisolution) {
		// 0 = shading
		// 1 = Line / FreeLine
		// 2 = Edge / FreeEdge
		// 3 = Wall
		// 4 = Number
		// 5 = Symbol
		let constraintMap: Dictionary<number> = {
			surface: 0,
			loopline: 1,
			loopedge: 2,
			wall: 3,
			number: 4,
		};
		let stext = JSON.parse(pu.solution as string);
		solution = stext[constraintMap[constraint]];
	} else {
		let sol_count = -1; // as list indexing starts at 0

		// loop through and check which 'OR' settings are selected
		[
			'surface',
			'number',
			'loopline',
			'loopedge',
			'wall',
			'square',
			'circle',
			'tri',
			'arrow',
			'math',
			'battleship',
			'tent',
			'star',
			'akari',
			'mine',
		].forEach(sol_or => {
			// Get checkbox value
			if (pu._document['sol_or_' + sol_or] === true) {
				sol_count++;
				if (sol_or === constraint) {
					solution = pu.solution[sol_count] as string[];
				}
			}
		});
	}
	return solution;
}

export function makeSolutionFromSolutionModeDigits(pu: PenpaPuzzle) {
	// Source: class_p.js function make_solution()
	let sol: any[] = [
		[], // 0 = shading
		[], // 1 = Line / FreeLine
		[], // 2 = Edge / FreeEdge
		[], // 3 = Wall
		[], // 4 = Number
		[], // 5 = Symbol
	];
	for (let key in pu['pu_a'].number) {
		if (pu['pu_q'].number[key] && pu['pu_q'].number[key][1] === 1 && (pu['pu_q'].number[key][2] === '1' || pu['pu_q'].number[key][2] === '10')) {
			// (Black) and (Normal or L) in Problem mode then ignore
		} else {
			// Sudoku only one number and multiple digits in same cell should not be considered, this is for single digit obtained from candidate submode
			if (pu['pu_a'].number[key][2] === '7') {
				// (Green or light blue or dark blue or red)
				if (pu['pu_a'].number[key][1] === 2 || pu['pu_a'].number[key][1] === 8 || pu['pu_a'].number[key][1] === 9 || pu['pu_a'].number[key][1] === 10) {
					let sum = 0,
						a;
					for (let j = 0; j < 10; j++) {
						if (pu['pu_a'].number[key][0][j] === 1) {
							sum += 1;
							a = j + 1;
						}
					}
					if (sum === 1) {
						sol[4].push(key + ',' + a);
					}
				}
			} else if (!isNaN(pu['pu_a'].number[key][0]) || !pu['pu_a'].number[key][0].match(/[^A-Za-z]+/)) {
				// ((Green or light blue or dark blue or red) and (Normal, M, S, L))
				if (
					(pu['pu_a'].number[key][1] === 2 ||
						pu['pu_a'].number[key][1] === 8 ||
						pu['pu_a'].number[key][1] === 9 ||
						pu['pu_a'].number[key][1] === 10) &&
					(pu['pu_a'].number[key][2] === '1' ||
						pu['pu_a'].number[key][2] === '5' ||
						pu['pu_a'].number[key][2] === '6' ||
						pu['pu_a'].number[key][2] === '10')
				) {
					sol[4].push(key + ',' + pu['pu_a'].number[key][0]);
				}
			}
		}
	}
	for (let i = 0; i < 6; i++) {
		sol[i] = sol[i].sort();
	}

	// A significant number of solution digits should be present
	// Note: It is not possible to reliably detect a complete solution
	if (sol[4].length > pu.centerlist.length / 2) {
		pu.solution = JSON.stringify(sol);
	}
}
