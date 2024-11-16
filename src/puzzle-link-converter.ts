import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleZipper } from './sudokupad/puzzlezipper';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { PenpaToSclConverter } from '@sudokupad/penpa-to-scl';
//import { PenpaLoader } from './penpa-loader/penpa-loader';
import { SclPuzzle } from './sclpuzzle';
import { expandTinyUrlAsync } from './tinyurl';
import { ConverterError } from './converter-error';
import { type FlagValues } from './converter-flags';

const rePenpaUrl = /\/penpa-edit\//i;
const rePuzzlinkUrl = /\/puzz\.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/;
const isPenpaUrl = (url: string) => url.match(rePenpaUrl) || url.match(rePuzzlinkUrl);

const reFpuzzlesUrl = /^\s*(http[s]?:\/\/)?([a-z]+\.)?f-puzzles.com\/.*\?load=(?<puzzleid>[^&]+)/;
const reSudokuPadUrl = /^\s*(?<puzzleid>sudokupad:\/\/puzzle\/(.+))/;
const reCtc = /(?:^\s*(http[s]?:\/\/)?(app.crackingthecryptic.com|([a-z]+\.)?sudokupad.app))(?:\/sudoku(?:\.html)?)?\/?(?:\?puzzleid=)?(?<puzzleid>.+)/;

export function encodeSCLPuz(puzzle: SclPuzzle | string) {
	const { zip } = PuzzleZipper;
	return 'scl' + loadFPuzzle.compressPuzzle(zip(puzzle));
}

export async function convertPuzzleAsync(input: string, flags: FlagValues) {
	const { unzip } = PuzzleZipper;
	let url = await expandTinyUrlAsync(input);
	if (!url) throw new ConverterError('empty puzzle id');

	// Penpa+ url format
	if (isPenpaUrl(url)) {
		let puzzle = new PenpaToSclConverter(flags).convertPenpaToScl(url);
		if (!puzzle) throw new ConverterError('Unexpected error occured during Penpa conversion. Please contact MarkTekfan');
		let settings = Object.entries(puzzle.settings || {})
			.map(([k, v]) => `setting-${k}=${v}`)
			.join('&');
		return encodeSCLPuz(puzzle) + (settings ? '?' + settings : '');
	}

	// f-puzzles url format
	if (url.match(reFpuzzlesUrl)) {
		let match = url.match(reFpuzzlesUrl);
		if (flags.fpuzzles2scl) {
			let puzzle = loadFPuzzle.parseFPuzzle(match![1]) as SclPuzzle;
			return encodeSCLPuz(puzzle);
		} else {
			return 'fpuzzles' + match!.groups!.puzzleid;
		}
	}

	// sudokupad link format
	if (reSudokuPadUrl.test(url)) {
		let match = url.match(reSudokuPadUrl);
		return match!.groups!.puzzleid;
	}

	// sudokupad.app url format
	if (reCtc.test(url)) {
		let match = url.match(reCtc);
		return match!.groups!.puzzleid;
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

			let settings = Object.entries((puzzle as any).settings || {})
				.map(([k, v]) => `setting-${k}=${v}`)
				.join('&');

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
	if (!/[:]/.test(url) && url.length < 50) {
		return url;
	}

	throw new ConverterError('Not a SudokuPad, f-puzzles or Penpa URL');
}
