import { PenpaConverter } from "./penpa-converter";
import { PenpaLoader } from "./penpa-loader/penpa-loader";
import { PuzzleZipper } from "./sudokupad/puzzlezipper.js";
import { loadFPuzzle } from "./sudokupad/fpuzzlesdecoder.js";
import { PuzzleLoader } from './sudokupad/puzzleloader.js';

export const puzzleLinkConverter = (() => {
	"use strict";

	const reFpuzzlesUrl = /[\.\/]+f-puzzles.com\/.*\?load=([^&]+)/;
	const reSudokuPadUrl = /^sudokupad:\/\/puzzle\/(.+)/;
	const reCtc = /(?:app.crackingthecryptic.com|sudokupad.app)(?:\/sudoku(?:\.html)?)?\/?(?:\?puzzleid=)?(?<puzzleid>.+)/

	const convertPuzzleUrl = url => {

		getPenpaDecoderOptions();

		const {unzip, zip, propMap} = PuzzleZipper;
		const encodeSCLPuz = puzzle => {
			// change prefix once app is updated
			propMap.duration = 'dur';
			delete propMap.d;
			propMap.d2 = 'd';

			let puzzleId = 'scl' + loadFPuzzle.compressPuzzle(zip(puzzle));

			propMap.duration = 'duration';
			delete propMap.d2;
			propMap.d = 'd2';
			return puzzleId;
		};

		// Penpa+ url format
		if (PenpaLoader.isPenpaUrl(url)) {
			let puzzle = PenpaConverter.convertPenpaPuzzle(url);
			if (!puzzle) throw {customMessage: 'Unexpected error occured during Penpa conversion. Please contact MarkTekfan'};
			let settings = Object.entries(puzzle.settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
			let puzzleId = encodeSCLPuz(puzzle) + (settings ? '?' + settings : '');
			return puzzleId;
		}

		// f-puzzles url format
		if (url.match(reFpuzzlesUrl)) {
			let match = url.match(reFpuzzlesUrl);
			return 'fpuzzles' + match[1];
		}

		// sudokupad link format
		if (url.match(reSudokuPadUrl)) {
			let match = url.match(reSudokuPadUrl);
			return match[1];
		}

		// sudokupad.app url format
		if (url.match(reCtc)) {
			let match = url.match(reCtc)
			let puzzleid = match[1];
			return puzzleid;
		}

		// raw puzzle id
		if (PuzzleLoader.getPuzzleFormat(url)) {
			return url;
		}

		// JSON format, should be scl or f-puzzles content
		if (/^[\s'"]*\{/.test(url)) {
			let json = url.replace(/^[\s'"]+/, '').replace(/[\s'"]+$/, '');

			try {
				let puzzle = {};
				try {
					puzzle = JSON.parse(json);
				}
				catch {
					puzzle = JSON.parse(unzip(json));
				}
				let settings = Object.entries(puzzle.settings || {}).map(([k, v]) => `setting-${k}=${v}`).join('&');
				// scl content
				if (puzzle.id && puzzle.cells) {
					var puzzleId = encodeSCLPuz(JSON.stringify(puzzle));
					return puzzleId + (settings ? '?' + settings : '');
				}
				// f-puzzles content
				else if (puzzle.size && puzzle.grid) {
					var puzzleId = 'fpuzzles' + loadFPuzzle.compressPuzzle(JSON.stringify(puzzle));
					return puzzleId + (settings ? '?' + settings : '');
				}
			}
			catch(ex) {
				throw {customMessage: ex.message};
			}

			throw {customMessage: "Not a SudokuPad or f-puzzles JSON puzzle format"};
		}
		
		// not a URL, probably a short ID
		if (!/[:]/.test(url) && url.length < 50) {
			return url;
		}

		throw {customMessage: "Not a SudokuPad, f-puzzles or Penpa URL"};
	}

	function getPenpaDecoderOptions() {
		let options = document.querySelectorAll('fieldset input[type=checkbox]');
		for(let option of options) {
			PenpaConverter.flags[option.name] = option.checked;
		}
	}

	const tinyurlUrls = [
		/tinyurl.com\/(.+)/,
		/f-puzzles.com\/\?id=(.+)/,
	]
	const tinypuzUrls = [
		/tinypuz.com\/(.+)/,
	]
	const expandTinyUrl = function(url) {
		return new Promise((resolve, reject) => {
			let tinyurl = tinyurlUrls.map(re => url.match(re)).find(m => m);
			if(tinyurl) {
				//fetch('http://localhost:3000/tinyurl/' + short[1])
				//fetch('https://marktekfan-api.azurewebsites.net/tinypuz/' + short[1])
				fetch('https://marktekfan-api.azurewebsites.net/tinyurl/' + tinyurl[1])
					.then(res => res.text())
					.then(text => {
						console.log('json response:', text)
						let result = JSON.parse(text)
						resolve(result.success ? result.longurl : url);
					})
					.catch(reject);
				return;
			}

			let tinypuz = tinypuzUrls.map(re => url.match(re)).find(m => m);
			if(tinypuz) {
				//fetch('http://localhost:3000/tinyurl/' + short[1])
				fetch('https://marktekfan-api.azurewebsites.net/tinypuz/' + tinypuz[1])
					.then(res => res.text())
					.then(text => {
						console.log('json response:', text)
						let result = JSON.parse(text)
						resolve(result.success ? result.longurl : url);
					})
					.catch(reject);
				return;
			}

			resolve(url);
		});
	}

	const loadPuzzle = {
		expandTinyUrl: expandTinyUrl,
		convertPuzzleUrl: convertPuzzleUrl
	}

	return loadPuzzle;
})();
