import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleZipper } from './sudokupad/puzzlezipper';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { PenpaToSclConverter } from './penpa-to-scl';
import { PenpaLoader } from './penpa-loader/penpa-loader';
import { SclPuzzle } from './sclpuzzle';
import { expandTinyUrlAsync } from './tinyurl';
import { ConverterError } from './converter-error';
import { type FlagValues } from './converter-flags';

const reFpuzzlesUrl = /[\.\/]+f-puzzles.com\/.*\?load=([^&]+)/;
const reSudokuPadUrl = /^sudokupad:\/\/puzzle\/(.+)/;
const reCtc = /(?:app.crackingthecryptic.com|sudokupad.app)(?:\/sudoku(?:\.html)?)?\/?(?:\?puzzleid=)?(?<puzzleid>.+)/;

export function encodeSCLPuz(puzzle: SclPuzzle | string) {
	const { zip } = PuzzleZipper;
	let puzzleId = 'scl' + loadFPuzzle.compressPuzzle(zip(puzzle));
	return puzzleId;
}

export async function convertPuzzleAsync(input: string, flags: FlagValues) {
	const { unzip } = PuzzleZipper;
	let url = await expandTinyUrlAsync(input);
	if (!url) return;

	// Penpa+ url format
	if (PenpaLoader.isPenpaUrl(url)) {
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
			return 'fpuzzles' + match![1];
		}
	}

	// sudokupad link format
	if (url.match(reSudokuPadUrl)) {
		let match = url.match(reSudokuPadUrl);
		return match![1];
	}

	// sudokupad.app url format
	if (url.match(reCtc)) {
		let match = url.match(reCtc);
		return match![1];
	}

	// raw puzzle id
	if (PuzzleLoader.getPuzzleFormat(url)) {
		return url;
	}

	// JSON format, should be scl or f-puzzles content
	if (/^[\s'"]*\{/.test(url)) {
		let json = url.replace(/^[\s'"]+/, '').replace(/[\s'"]+$/, '');

		try {
			let puzzle = {} as any;
			try {
				puzzle = JSON.parse(json);
			} catch {
				puzzle = JSON.parse(unzip(json));
			}

			let settings = Object.entries(puzzle.settings || {})
				.map(([k, v]) => `setting-${k}=${v}`)
				.join('&');

			// scl content
			if (puzzle.cells) {
				var puzzleId = encodeSCLPuz(puzzle);
				return puzzleId + (settings ? '?' + settings : '');
			}

			// f-puzzles content
			if (puzzle.size && puzzle.grid) {
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

	// not a URL, probably a short ID
	if (!/[:]/.test(url) && url.length < 50) {
		return url;
	}

	throw new ConverterError('Not a SudokuPad, f-puzzles or Penpa URL');
}
