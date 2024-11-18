import type { SclPuzzle } from './sclpuzzle';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { encodeSCLPuz }from './puzzle-link-converter'

export type FogLink = {
    cell: RC;
    cells: RC[];
}

export type FogLinks = FogLink[];


export function fpuzHasRemoteFog(fpuzzleId: string) : boolean {
    console.log(fpuzzleId);
    let fpuzzle = loadFPuzzle.decodeFPuzzleData(fpuzzleId);
    console.log(fpuzzle);
    // - Convert fpuzzleid to fpuzzle
    // - detect fog-link 
    return false;
}

export function convertRemoteFog(puzzle: SclPuzzle): SclPuzzle {
	createFogLink(puzzle);
    return puzzle;
}

export async function convertRemoteFogPuzzleId(puzzleId: string) : Promise<string> {
	const { isRemotePuzzleId, parsePuzzleData, fetchPuzzle } = PuzzleLoader;
	if (isRemotePuzzleId(puzzleId)) {
		try {
			// expand short puzzleid
			puzzleId = await fetchPuzzle(puzzleId) ?? puzzleId;
			if (!puzzleId || isRemotePuzzleId(puzzleId)) {
				return puzzleId;
			}
		} catch (err) {
			return puzzleId;
		}
	}

	let puzzle = await parsePuzzleData(puzzleId) as SclPuzzle;
	if (!createFogLink(puzzle)) 
		return puzzleId;
	
	// TODO: preserve URL parameters
	puzzleId = encodeSCLPuz(JSON.stringify(puzzle));
    return puzzleId;
}

function createFogLink(puzzle: SclPuzzle): boolean {
    // Foglink aleady exits
	if ((puzzle.foglink ?? []).length > 0) return false;

	let foglinks = [] as FogLinks;
	// Find linked cells
	[].concat(puzzle.underlays as any || [], puzzle.overlays as any || []).forEach((part: any) => {
		if (part.text && part.text.match(/[A-Z]/i)) {
			// Find cages with value equal to overlay text
			let linkedCages = puzzle.cages?.filter(cage => cage.value === part.text && cage.cells);
			linkedCages?.forEach(cage => {
				let cell = [Math.floor(part.center[0]), Math.floor(part.center[1])] as RC;
				let foglink = foglinks.find(fl => fl.cell[0] == cell[0] && fl.cell[1] == cell[1]);
				if (!foglink) {
					foglink = {cell, cells:[]};
					foglinks.push(foglink);
				}
				cage.cells?.forEach(([r, c]) => {
					foglink.cells.push([r, c]);
				})
				cage.cells = undefined; // Remove visibly from puzzle
				part.text = undefined; // Remove visibly from puzzle
			});
		}
	});

	// Add fog over linked cells
	if (foglinks.length > 0) {
		const rows = (puzzle.cells || []).length;
		const cols = Math.max.apply(Math, (puzzle.cells || []).map(row => row.length));
		puzzle.foglink = foglinks;
		let foglight = puzzle.foglight ??= []; 
		let linkedCells = foglinks.map(fl => fl.cells).flatMap(o => o);
		for(let r = 0; r < rows; r++) {
			for(let c = 0; c < cols; c++) {
				if (!linkedCells.some(rc => rc[0] === r && rc[1] === c)) {
					foglight.push([r, c]);
				}				
			}
		}
	}

    return foglinks.length > 0;
}