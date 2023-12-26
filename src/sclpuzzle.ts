export interface SclCell {
	value?: string | number;
	given?: boolean;
	pencilMarks?: (string | number)[];
}

export interface SclCage {
	value?: string;
	unique?: boolean;
	cells?: RC[];
	borderColor?: string;
}

export type SclFeature = 'regions' | 'lines' | 'underlays' | 'overlays' | 'arrows' | 'cages';

export class SclPuzzle {
	id?: string;
	cellSize?: number;
	cells: SclCell[][];
	settings?: Dictionary;
	metadata?: Dictionary<unknown>;
	global?: Array<string>;

	regions?: RC[][];
	lines?: object[];
	underlays?: object[];
	overlays?: object[];
	arrows?: object[];
	cages?: SclCage[];

	constructor(rows: number, cols: number) {
		this.regions = [];
		this.cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({})));
	}

	addFeature(feature: SclFeature, part: any) {
		if (this[feature] === undefined) this[feature] = [];
		if (typeof part === 'object' && !Array.isArray(part)) {
			part = Object.keys(part).reduce((acc, cur) => Object.assign(acc, part[cur] === undefined ? {} : { [cur]: part[cur] }), {});
		}
		this[feature]!.push(part);
	}
}
