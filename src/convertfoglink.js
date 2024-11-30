
// const PuzzleTypeFogLink = {
// 	type: 'foglink',
// 	label: 'Fog Link',
// 	converter: convertFogLink,
// 	makeUrl: makeUrlFogLink,
// 	tabs: [
// 		//{label: 'Title / Rules', html: HtmlClassicTitleAuthorRules},
// 		{label: 'Import Puzzle', html: `
// 			<div><label>Shortid: <input name="shortid"></label></div>
// 			<fieldset style="margin-top: 1rem;">
// 				<legend>Puzzle Data</legend>
// 				<div><label>Format: <input name="puzformat" readonly disabled></label></div>
// 				<!--
// 				<div><label>Edit Log:</label><br><div name="editlog" class="prettyprint lang-json" style="width: 100%;"></div></div>
// 				-->
// 			</fieldset>
// 			`
// 		},
// 	],
// 	defaults: [
// 		{
// 			//shortid: 'ygjxjkzi6a', // Already foglinked
// 			shortid: '3ox6e8nkqr',
// 			//shortid: '3n1j3p0yod',
// 			//shortid: '29nTttfqqt',
// 			//shortid: 'ece6lu58om', // SCL demo
// 			//shortid: 'ksbcsvq1r8', // two-letter labels
// 		}
// 	]
// };

export function extractTriggerEffects(format, json) {
	//console.log('extractTriggerEffects:', format, json);
	const invertRc = (cells, rcs) => {
		rcs = rcs.match(/r(\d+)c(\d+)/g);
		let cellRc = cells.flatMap((row, r) => row.map((_, c) => `r${r + 1}c${c+ 1}`));
		return cellRc.filter(rc => !rcs.includes(rc));
	};
	const arrToRc = ([r, c]) => `r${Math.floor(r) + 1}c${Math.floor(c) + 1}`;
	const reTriggerLabel = /^[A-Z]{1,2}$/;
	const {underlays = [], overlays = [], cages = [], text = [], cage = []} = json;
	let edits = [];
	if(text.length > 0 && cage.length > 0) {
		edits = text
			.filter(({value}) => reTriggerLabel.test(value))
			.map(text => ({text, cages: cage.filter(c => text.value === c.value)}))
			.filter(({text, cages}) => cages.length > 0)
			.map(({text, cages}) => ({
				remove: {text: [text], cage: cages},
				insertTE: {
					trigger: {type: 'cellvalue', cell: text.cells.join('').toLowerCase()},
					effect: {type: 'foglight', cells: cages.flatMap(c => c.cells).join('').toLowerCase()}
				}
			}));
	}
	else if((underlays.length > 0 || overlays.length > 0) && cages.length > 0) {
		let triggerLabels = [...new Set([...underlays, ...overlays]
			.map(({text}) => text)
			.filter(text => reTriggerLabel.test(text) && cages.filter(c => text === c.value).length > 0)
		)].sort();
		edits = triggerLabels
			.map(label => {
				let u = underlays.filter(({text}) => text === label),
						o = overlays.filter(({text}) => text === label),
						c = cages.filter(({value}) => value === label);
				return {
					insertTE: {
						trigger: {type: 'cellvalue', cell: [...u, ...o].map(({center}) => arrToRc(center)).sort().join('')},
						effect: {type: 'foglight', cells: c.flatMap(({cells}) => cells.map(arrToRc)).join('')}
					},
					remove: {underlays: u, overlays: o, cages: c}
				};
			});
	}
	else {
		throw new Error(`Unable to find triggereffect markers. Keys found: ${JSON.stringify(Object.keys(json))}`);
	}
	const editLog = [], triggereffect = json.triggereffect = [];
	for(const {remove, insertTE} of edits) {
		for(const [prop, items] of Object.entries(remove)) {
			for(const item of items) {
				editLog.push({msg: `Remove "${prop}" item`, json: item});
				json[prop].splice(json[prop].indexOf(item), 1);
			}
		}
		triggereffect.push(insertTE);
		editLog.push({msg: `Insert triggereffect`, json: insertTE});
	}
	if(json.foglight === undefined) {
		let cells = json.cells || json.grid;
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
	return editLog;
}

// function makeUrlFogLink({format, puzzle}) {
// 	//console.warn('makeUrlFogLink:', format, puzzle);
// 	let url;
// 	switch(format) {
// 		case 'scl': url = `/scf?puzzleid=scl${loadFPuzzle.compressPuzzle(JSON.stringify(puzzle))}`; break;
// 		case 'fpuz': url = `/scf?puzzleid=fpuz${loadFPuzzle.compressPuzzle(JSON.stringify(puzzle))}`; break;
// 		default: throw new Error(`Unsupported format: ${format}`);
// 	}
// 	return url;
// }

// async function shortidToJson(shortid) {
// 	console.warn('shortidToJson:', shortid);
// 	const {fetchPuzzle, getPuzzleFormat, decompressPuzzleId, saveJsonUnzip} = PuzzleLoader;
// 	let puzzleid = await fetchPuzzle(shortid);
// 	let format = getPuzzleFormat(puzzleid);
// 	let puzdecomp = decompressPuzzleId(puzzleid);
// 	if(format === 'scl') puzdecomp = saveJsonUnzip(puzdecomp);
// 	let json;
// 	switch(format) {
// 		case 'scl': json = saveJsonUnzip(puzdecomp); break;
// 		default: json = JSON.parse(puzdecomp);
// 	}
// 	return {format, json};
// }

// async function convertFogLink(data) {
// 	console.warn('convertFogLink:', data);
// 	let {shortid} = data;
// 	let {format, json} = await shortidToJson(shortid);
// 	//setElVal('puzformat', format);
// 	//console.log('  json:', JSON.parse(JSON.stringify(json)));
// 	let editLog = extractTriggerEffects(format, json);
// 	//console.log('  json AFTER:', json);
// 	/*
// 	console.log(getNamedEl('editlog'));//, editLog.join('\n'));
// 	//getNamedEl('editlog').textContent = editLog.join('\n');
// 	getNamedEl('editlog').textContent = '{}';
// 	let ppEl = getEl('.prettyprinted');
// 	if(ppEl) ppEl.classList.remove('prettyprinted');
// 	PR.prettyPrint();
// 	*/
// 	return {format, puzzle: json};
// }

//PuzzleImportTypes.push(PuzzleTypeFogLink);
