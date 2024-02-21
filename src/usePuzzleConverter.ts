import { useAppState } from '@/stores/appState';
//import { storeToRefs } from 'pinia';
import { PenpaToSclConverter } from '@/penpa-to-scl';

import { ConverterFlags, type FlagName } from '@/converter-flags';

export function usePuzzleConverter() {
	function ConvertPuzzle() {
		const appState = useAppState();
		//const { selectedAction, selectedTarget, selectedFlags, converting, inputUrl, outputUrl } = storeToRefs(appState);

		try {
			appState.converting = true;

			const converterFlags = new ConverterFlags();
			converterFlags.setFlagValues(appState.selectedFlags as FlagName[]);

			const converter = new PenpaToSclConverter(converterFlags.getFlagValues());

			const puzzle = converter.convertPenpaToScl(appState.inputUrl);
			if (!puzzle) {
				appState.outputUrl = 'Error';
			} else {
				appState.outputUrl = JSON.stringify(puzzle);
			}
		} finally {
			setTimeout(() => (appState.converting = false), 500);
		}
	}

	return {
		ConvertPuzzle,
	};
}
