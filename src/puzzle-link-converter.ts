import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleZipper } from './sudokupad/puzzlezipper';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { PenpaToSclConverter } from './penpa-to-scl';
import { PenpaLoader } from './penpa-loader/penpa-loader';
import { SclPuzzle } from './sclpuzzle';
import { expandTinyUrlAsync } from './tinyurl';
import { ConverterError } from './converter-error';
import { type FlagValues } from './converter-flags';
import { fpuzHasRemoteFog, convertRemoteFog, convertRemoteFogPuzzleId } from './foglink-feature';

const reFpuzzlesUrl = /^\s*(http[s]?:\/\/)?([a-z]+\.)?f-puzzles.com\/.*\?load=(?<fpuzzleid>[^&]+)/;
const reSudokuPadUrl = /^\s*(?<puzzleid>sudokupad:\/\/puzzle\/(.+))/;
const reCtc = /(?:^\s*(http[s]?:\/\/)?(app.crackingthecryptic.com|([a-z]+\.)?sudokupad.app))(?:\/sudoku(?:\.html)?)?\/?(?:\?puzzleid=)?(?<puzzleid>.+)/;

export function encodeSCLPuz(puzzle: SclPuzzle | string) {
	const { zip } = PuzzleZipper;
	return 'scl' + loadFPuzzle.compressPuzzle(zip(puzzle));
}

export async function convertPuzzleAsync(input: string, flags: FlagValues) {
	const { unzip } = PuzzleZipper;
	let url = await expandTinyUrlAsync(input.trim());
	if (!url) throw new ConverterError('empty puzzle id');

	// Penpa+ url format
	if (PenpaLoader.isPenpaUrl(url)) {
		let puzzle = new PenpaToSclConverter(flags).convertPenpaToScl(url);
		if (!puzzle) throw new ConverterError('Unexpected error occured during Penpa conversion. Please contact MarkTekfan');
		if (flags.foglink) {
			convertRemoteFog(puzzle);
		}
		let settings = Object.entries(puzzle.settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
		delete puzzle.settings;
		return encodeSCLPuz(puzzle) + (settings ? '?' + settings : '');
	}

	// f-puzzles url format
	if (reFpuzzlesUrl.test(url)) {
		let {fpuzzleid} = url.match(reFpuzzlesUrl)!.groups!;
		if (flags.fpuzzles2scl || (flags.foglink && fpuzHasRemoteFog(fpuzzleid))) {
			let puzzle = loadFPuzzle.parseFPuzzle(fpuzzleid) as SclPuzzle;			
			if (flags.foglink) {
				convertRemoteFog(puzzle);
			}
			let settings = Object.entries(puzzle.settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
			delete puzzle.settings;
			return encodeSCLPuz(puzzle) + (settings ? '?' + settings : '');
		} else {
			return 'fpuzzles' + fpuzzleid;
		}
	}

	// sudokupad link format
	if (reSudokuPadUrl.test(url)) {
		let {puzzleid} = url.match(reSudokuPadUrl)!.groups!;
		if (flags.foglink) {
			puzzleid = await convertRemoteFogPuzzleId(puzzleid);
		}
		return puzzleid;
	}

	// sudokupad.app url format
	if (reCtc.test(url)) {
		let {puzzleid} = url.match(reCtc)!.groups!;
		if (flags.foglink) {
			puzzleid = await convertRemoteFogPuzzleId(puzzleid);
		}
		return puzzleid;
	}

	// raw puzzle id
	if (PuzzleLoader.getPuzzleFormat(url)) {
		return url;
	}

	function isSclFormat(puzzle: any): puzzle is SclPuzzle {
		return puzzle.id && puzzle.cells ? true : false;
	}
	function isFPuzzlesFormat(puzzle: any): puzzle is SclPuzzle {
		return puzzle.size && puzzle.grid ? true : false;
	}
	// JSON format, should be scl or f-puzzles content
	if (url.includes('{')) {
		let json = url.replace(/^[\s'"]+/, '').replace(/[\s'"]+$/, '');

		try {
			let puzzle = {} as unknown;
			try {
				puzzle = JSON.parse(json);
			} catch {
				puzzle = JSON.parse(unzip(json));
			}

			if (flags.foglink) {
				convertRemoteFog(puzzle as any);
			}

			let settings = Object.entries((puzzle as SclPuzzle).settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
			delete (puzzle as SclPuzzle).settings; 

			// scl content
			if (isSclFormat(puzzle)) {
				var puzzleId = encodeSCLPuz(JSON.stringify(puzzle));
				return puzzleId + (settings ? '?' + settings : '');
			}

			// f-puzzles content
			if (isFPuzzlesFormat(puzzle)) {
				if (flags.fpuzzles2scl) {
					let sclPuzzle = loadFPuzzle.parseFPuzzle(puzzle) as SclPuzzle;
					return encodeSCLPuz(sclPuzzle) + (settings ? '?' + settings : '');
				} else {
					var puzzleId = 'fpuzzles' + loadFPuzzle.compressPuzzle(JSON.stringify(puzzle));
					return puzzleId + (settings ? '?' + settings : '');
				}
			}

			throw new ConverterError('Not a SudokuPad or f-puzzles JSON puzzle format');
		} catch (ex: any) {
			throw new ConverterError(ex.message);
		}
	}

	// not a URL, probably a naked short ID
	if (!/[:]/.test(url) && url.length < 100) {
		return url;
	}

	throw new ConverterError('Not a SudokuPad, f-puzzles or Penpa URL');
}
