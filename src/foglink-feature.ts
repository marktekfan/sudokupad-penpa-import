import type { SclPuzzle } from './sclpuzzle';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { encodeSCLPuz }from './puzzle-link-converter'
import { extractTriggerEffects } from './convertfoglink'
// import { useAppState } from './stores/appState';

export function fpuzHasRemoteFog(fpuzzleId: string) : boolean {
    console.log(fpuzzleId);
    let fpuzzle = loadFPuzzle.decodeFPuzzleData(fpuzzleId);
    console.log(fpuzzle);

	let log = convertFogLink(fpuzzle);
	return log.length > 0;
}

export function convertRemoteFog(puzzle: SclPuzzle): SclPuzzle {
	let log = convertFogLink(puzzle);
	console.log(log);
	if (log.length > 0) {
		puzzle.settings ??= {};
		puzzle.settings['foganim'] = 1;
	}
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
	let log = convertFogLink(puzzle);
	if (log.length === 0)
		return puzzleId;
	
	puzzle.settings ??= {};
	puzzle.settings['foganim'] = 1;

	let settings = Object.entries(puzzle.settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
	delete puzzle.settings;

	puzzleId = encodeSCLPuz(JSON.stringify(puzzle)) + (settings ? '?' + settings : '');
    return puzzleId;
}

function convertFogLink(json: any) : any[] {	
	let edits = [] as any[];
	// Don't overwrite existing json.triggereffect
	if ((json.triggereffect || []).length === 0) {	
		try {
			let format = (json.cells) ? 'scl': 'fpuz';
			edits = extractTriggerEffects(format, json);
			if (edits.length > 0) {
				// const appState = useAppState();
				// const destination = appState.selectedTarget;
				// if (destination.includes('sudokupad.app') && !destination.includes('beta')) {
				// 	appState.selectedTarget = 'https://beta.sudokupad.app/';
				// }
			}
		} catch(err) {
			const error = err as Error;
			if (error.message && !error.message.includes("Unable to find triggereffect markers")) {
				console.error(err);
				throw err;
			}
		}
	}
	return edits;
}