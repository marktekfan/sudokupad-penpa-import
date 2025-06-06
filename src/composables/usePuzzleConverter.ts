import { useAppState, type AppAction } from '@/stores/appState';
import { ConverterFlags, type FlagName } from '@/converter-flags';
import { convertPuzzleAsync } from '@/puzzle-link-converter';
import { ConverterError } from '@/converter-error';
import { PuzzleLoader } from '@/sudokupad/puzzleloader';
import { loadFPuzzle } from '@/sudokupad/fpuzzlesdecoder';
import { getMetadata } from '@/edit-metadata';
import stringifyPretty from 'json-stringify-pretty-compact';

const reFPuzPrefix = /^(fpuz(?:zles)?)(.*)/;
const stripFPuzPrefix = (fpuzzle: string) => fpuzzle.replace(reFPuzPrefix, '$2');

let _lastActionSelection: AppAction | undefined;

export function usePuzzleConverter() {
	async function ConvertPuzzle(redirect = false) {
		try {
			const appState = useAppState();
			const selectedAction = appState.selectedAction;

			if (appState.testMode) {
				localStorage.setItem('testurl', appState.inputUrl);
			}

			const converterFlags = new ConverterFlags();
			converterFlags.setFlagValues(appState.selectedFlags as FlagName[]);
			converterFlags.persist();

			let puzzleId = await convertPuzzleAsync(appState.inputUrl, converterFlags.getFlagValues());

			if (puzzleId === undefined) {
				throw new ConverterError('Not a recognized puzzle URL');
			}

			const destination = appState.selectedTarget;
			if (!destination.includes('crackingthecryptic')) {
				localStorage.destination = destination;
			}

			if (destination.includes('?')) {
				puzzleId = puzzleId.replace('?', '&'); // Replace 2nd '?' with '&'
			}
			let newUrl = destination + puzzleId;
			//console.log(redirect, redirect.length);

			if (redirect) {
				window.open(newUrl, '_self');
				return;
			}

			if (!selectedAction.includes('json') && !selectedAction.includes('metadata')) {
				_lastActionSelection = selectedAction;
			}

			switch (selectedAction) {
				case 'create-url':
					appState.outputUrl = newUrl;
					break;

				// case 'create-tinyurl':
				// 	{
				// 		generatedUrlElem.value = '';
				// 		generatedUrlElem.placeholder = '...Creating TinyPuz URL...';
				// 		let shortUrl = await request_tinypuz_shortlink(newUrl);
				// 		if (shortUrl) {
				// 			generatedUrlElem.value = shortUrl;
				// 			generatedUrlElem.select();
				// 			generatedUrlElem.focus();
				// 		} else {
				// 			generatedUrlElem.value = 'Error while creating TinyPuz URL';
				// 		}
				// 		buttonCopyUrlElem.disabled = !newUrl;
				// 	}
				// 	break;

				case 'edit-metadata':
					const puzzle = await ConvertPuzzleId(puzzleId);
					appState.metadata = getMetadata(puzzle);
					appState.metadata.dialogVisible = true;

					appState.selectedAction = _lastActionSelection ?? 'open';
					break;

				case 'convert-tojson':
					const prettyFormat = (obj: unknown) => stringifyPretty(obj, { maxLength: 150 });
					appState.inputUrl = prettyFormat(await ConvertPuzzleId(puzzleId));
					appState.outputUrl = '';
					appState.selectedAction = _lastActionSelection ?? 'open';
					break;

				default: {
					window.open(newUrl, '_blank');
					return;
				}
			}
		} catch (err) {
			console.error(err);
			if (err instanceof ConverterError) {
				throw new ConverterError(err.message);
			} else {
				throw new ConverterError('An error occured while processing the URL');
			}
		}
	}

	return {
		ConvertPuzzle,
	};
}

export async function ConvertPuzzleId(puzzleId: string) {
	const { isRemotePuzzleId, parsePuzzleData, fetchPuzzle } = PuzzleLoader;

	puzzleId = puzzleId.split('?')[0]; // Strip off parameters (settings)
	puzzleId = puzzleId.split('&')[0]; // Strip off parameters (settings)

	if (isRemotePuzzleId(puzzleId)) {
		try {
			// expand short puzzleid
			puzzleId = await fetchPuzzle(puzzleId);
			if (!puzzleId || isRemotePuzzleId(puzzleId)) {
				throw new ConverterError('Not a recognized JSON puzzle format');
			}
		} catch (err) {
			console.error(err);
			throw new ConverterError('Short puzzle ID not found');
		}
	}

	if (reFPuzPrefix.test(puzzleId)) {
		try {
			let decodedUrl = loadFPuzzle.saveDecodeURIComponent(stripFPuzPrefix(puzzleId));
			return JSON.parse(loadFPuzzle.decompressPuzzle(decodedUrl)!);
		} catch (err) {
			console.error(err);
			throw new ConverterError('Error while decoding F-Puzzle format');
		}
	} else {
		return await parsePuzzleData(puzzleId);
	}
}
