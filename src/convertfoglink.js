
const PuzzleTypeFogLink = {
	type: 'foglink',
	label: 'Fog Link',
	converter: convertFogLink,
	makeUrl: makeUrlFogLink,
	tabs: [
		//{label: 'Title / Rules', html: HtmlClassicTitleAuthorRules},
		{label: 'Import Puzzle', html: `
			<div><label>Shortid: <input name="shortid"></label></div>
			<fieldset style="margin-top: 1rem;">
				<legend>Puzzle Data</legend>
				<div><label>Format: <input name="puzformat" readonly disabled></label></div>
				<!--
				<div><label>Edit Log:</label><br><div name="editlog" class="prettyprint lang-json" style="width: 100%;"></div></div>
				-->
			</fieldset>
			`
		},
	],
	defaults: [
		{
			//shortid: 'ygjxjkzi6a', // Already foglinked
			shortid: '3ox6e8nkqr',
			//shortid: '3n1j3p0yod',
			//shortid: '29nTttfqqt',
			//shortid: 'ece6lu58om', // SCL demo
			//shortid: 'ksbcsvq1r8', // two-letter labels
		}
	]
};

export function extractTriggerEffects(json) {
	let format = (json.cells) ? 'scl': 'fpuz';
	//console.log('extractTriggerEffects:', format, json);
	const invertRc = (cells, rcs) => {
		rcs = rcs.match(/r(\d+)c(\d+)/g);
		let cellRc = cells.flatMap((row, r) => row.map((_, c) => `r${r + 1}c${c+ 1}`));
		return cellRc.filter(rc => !rcs.includes(rc));
	};
	const arrToRc = ([r, c]) => `r${Math.floor(r) + 1}c${Math.floor(c) + 1}`;
	const reTriggerLabel = /^[A-Z]{1,2}$/;
	const {underlays = [], overlays = [], cages = [], text = [], cage = []} = json;
	//if(underlays[2]) underlays[2].text = 'C';
	let edits = [];
	if(text.length > 0 && cage.length > 0) {
		edits.push(...text
			.filter(({value}) => reTriggerLabel.test(value))
			.map(text => ({text, cages: cage.filter(c => text.value === c.value)}))
			.filter(({text, cages}) => cages.length > 0)
			.map(({text, cages}) => ({
				remove: {text: [text], cage: cages},
				insertTE: {
					trigger: {type: 'cellvalue', cell: text.cells.join('').toLowerCase()},
					effect: {type: 'foglight', cells: cages.flatMap(c => c.cells).join('').toLowerCase()}
				}
			})));
	}
	else {
		if(underlays.length > 0 && cages.length > 0) {
			edits.push(...underlays
				.filter(({text}) => reTriggerLabel.test(text))
				.map(underlay => ({underlay, cages: cages.filter(c => underlay.text === c.value)}))
				.filter(({underlay, cages}) => cages.length > 0)
				.map(({underlay, cages}) => ({
					remove: {underlays: [underlay], cages},
					insertTE: {
						trigger: {type: 'cellvalue', cell: arrToRc(underlay.center)},
						effect: {type: 'foglight', cells: cages.flatMap(c => c.cells.map(arrToRc)).join('')}
					}
				})));
		}
		if(overlays.length > 0 && cages.length > 0) {
			edits.push(...overlays
				.filter(({text}) => reTriggerLabel.test(text))
				.map(overlay => ({overlay, cages: cages.filter(c => overlay.text === c.value)}))
				.filter(({overlay, cages}) => cages.length > 0)
				.map(({overlay, cages}) => ({
					remove: {overlays: [overlay], cages},
					insertTE: {
						trigger: {type: 'cellvalue', cell: arrToRc(overlay.center)},
						effect: {type: 'foglight', cells: cages.flatMap(c => c.cells.map(arrToRc)).join('')}
					}
				})));
		}
		
	}
	//else {
	//	throw new Error(`Unable to find triggereffect markers: ${Object.keys(json)}`);
	//}
	const editLog = [], triggereffect = json.triggereffect = [];
	if (edits.length > 0) {
		for(const {remove, insertTE} of edits) {
			for(const [prop, items] of Object.entries(remove)) {
				for(const item of items) {
					editLog.push(`Remove "${prop}" item: ${JSON.stringify(item)}`);
					json[prop].splice(json[prop].indexOf(item), 1);
				}
			}
			triggereffect.push(insertTE);
			editLog.push(`Insert triggereffect: ${JSON.stringify(insertTE)}`);
		}
		if(json.foglight === undefined) {
			let cells = json.cells || json.grid;
			//let inverted = invertRc(cells, edits.flatMap(({insertTE: {effect: {cells}}}) => cells).join(''));
			json.foglight = invertRc(cells, edits.flatMap(({insertTE: {effect: {cells}}}) => cells).join('')).join('');
			switch(format) {
				case 'scl':
					json.foglight = (json.foglight.match(/r\d+c\d+/g) || [])
						.map(rc => rc.match(/r(\d+)c(\d+)/)
						.slice(1).map(n => parseInt(n) - 1));
					break;
				case 'fpuz':
					json.foglight = (json.foglight.toUpperCase().match(/R\d+C\d+/g) || []);
					break;
			}
		}
	}
	return editLog;
}

function makeUrlFogLink({format, puzzle}) {
	//console.warn('makeUrlFogLink:', format, puzzle);
	let url;
	switch(format) {
		case 'scl': url = `/scf?puzzleid=scl${loadFPuzzle.compressPuzzle(JSON.stringify(puzzle))}`; break;
		case 'fpuz': url = `/scf?puzzleid=fpuz${loadFPuzzle.compressPuzzle(JSON.stringify(puzzle))}`; break;
		default: throw new Error(`Unsupported format: ${format}`);
	}
	return url;
}

async function shortidToJson(shortid) {
	console.warn('shortidToJson:', shortid);
	const {fetchPuzzle, getPuzzleFormat, decompressPuzzleId, saveJsonUnzip} = PuzzleLoader;
	let puzzleid = await fetchPuzzle(shortid);
	let format = getPuzzleFormat(puzzleid);
	let puzdecomp = decompressPuzzleId(puzzleid);
	if(format === 'scl') puzdecomp = saveJsonUnzip(puzdecomp);
	let json;
	switch(format) {
		case 'scl': json = saveJsonUnzip(puzdecomp); break;
		default: json = JSON.parse(puzdecomp);
	}
	return {format, json};
}

async function convertFogLink(data) {
	console.warn('convertFogLink:', data);
	let {shortid} = data;
	let {format, json} = await shortidToJson(shortid);
	//setElVal('puzformat', format);
	//console.log('  json:', JSON.parse(JSON.stringify(json)));
	let editLog = extractTriggerEffects(format, json);
	//console.log('  json AFTER:', json);
	/*
	console.log(getNamedEl('editlog'));//, editLog.join('\n'));
	//getNamedEl('editlog').textContent = editLog.join('\n');
	getNamedEl('editlog').textContent = '{}';
	let ppEl = getEl('.prettyprinted');
	if(ppEl) ppEl.classList.remove('prettyprinted');
	PR.prettyPrint();
	*/
	return {format, puzzle: json};
}

//PuzzleImportTypes.push(PuzzleTypeFogLink);
