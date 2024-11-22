import type { SclPuzzle } from './sclpuzzle';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { encodeSCLPuz }from './puzzle-link-converter'
import { extractTriggerEffects } from './convertfoglink'

export function fpuzHasRemoteFog(fpuzzleId: string) : boolean {
    console.log(fpuzzleId);
    let fpuzzle = loadFPuzzle.decodeFPuzzleData(fpuzzleId);
    console.log(fpuzzle);

	let log = extractTriggerEffects(fpuzzle);
	return log.length > 0;
}

export function convertRemoteFog(puzzle: SclPuzzle): SclPuzzle {
	let log = extractTriggerEffects(puzzle);
	console.log(log);
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
	let log = extractTriggerEffects(puzzle);
	if (log.length === 0)
		return puzzleId;
	
	// TODO: preserve URL parameters
	puzzleId = encodeSCLPuz(JSON.stringify(puzzle));
    return puzzleId;
}
