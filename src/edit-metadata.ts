import { isFPuzzlesFormat } from '@/puzzle-link-converter';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import type { SclPuzzle } from './sclpuzzle';

export interface Metadata {
	sourcePuzzle: SclPuzzle;
	title: string;
	author: string;
	rules: string;
	solution: string;
	msgcorrect: string;
	dialogVisible?: boolean;
}

export function getMetadata(puzzle: any): Metadata {
	if (isFPuzzlesFormat(puzzle)) {
		// Always convert f-puzzles format to SCL format
		puzzle = loadFPuzzle.parseFPuzzle(puzzle) as SclPuzzle;
	}

	const metadata: Metadata = {
		sourcePuzzle: puzzle,
		title: '',
		author: '',
		rules: '',
		solution: '',
		msgcorrect: '',
	};

	metadata.title = (puzzle.metadata?.title?.toString() || getCageMetaData(puzzle, 'title')) as string;
	metadata.author = (puzzle.metadata?.author?.toString() || getCageMetaData(puzzle, 'author')) as string;
	metadata.rules = (puzzle.metadata?.rules?.toString() || getCageMetaData(puzzle, 'rules')) as string;
	metadata.solution = (puzzle.metadata?.solution?.toString() || getCageMetaData(puzzle, 'solution')) as string;
	metadata.msgcorrect = (puzzle.metadata?.msgcorrect?.toString()  || getCageMetaData(puzzle, 'msgcorrect')) as string;

	return metadata;
}

export function updateMetadata(metadata: Metadata): SclPuzzle {
	let puzzle = metadata.sourcePuzzle;

	if (!puzzle.metadata) {
		// Insert metadata after id
		puzzle = metadata.sourcePuzzle = Object.assign({id: puzzle.id, metadata: {}}, puzzle);
	}

	removeMetadataCages(puzzle);
	puzzle.metadata!.title = metadata.title.trim();
	puzzle.metadata!.author = metadata.author.trim();
	puzzle.metadata!.rules = metadata.rules.trim();
	puzzle.metadata!.solution = metadata.solution.trim();
	puzzle.metadata!.msgcorrect = (metadata.msgcorrect || '').trim();

	// Remove if it's empty
	if (!puzzle.metadata!.msgcorrect) delete puzzle.metadata!.msgcorrect;
	if (!puzzle.metadata!.solution) delete puzzle.metadata!.solution;

	return puzzle;
}

const reMetaTags = /^(.+?):\s*([\s\S]+)/m;

function getCageMetaData(puzzle: SclPuzzle, key: string): string {
	for (let cage of puzzle.cages || []) {
		if ((cage.cells || []).length === 0) {
			let [_, metaName, metaVal] = String(cage.value || '').match(reMetaTags) || [];
			if (metaName === key) {
				return metaVal.trim();
			}
		}
	}
	return '';
}

function removeMetadataCages(puzzle: SclPuzzle) {
	let cages = puzzle.cages || [];
	for (let i = cages.length - 1; i >= 0; i--) {
		const cage = cages[i];
		if ((cage.cells || []).length === 0) {
			let [_, metaName, _metaVal] = String(cage.value || '').match(reMetaTags) || [];
			if (['title', 'author', 'rules', 'solution', 'msgcorrect'].includes(metaName)) {
				// Remove cage with metadata
				cages.splice(i, 1);
			}
		}
	}
}
