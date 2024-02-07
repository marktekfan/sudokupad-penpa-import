import stringifyPretty from 'json-stringify-pretty-compact';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder';
import { PuzzleLoader } from './sudokupad/puzzleloader';
import { Swal } from './Swal';
import { addHandler, addDownEventHandler, removeDownEventHandler, loadFromFile } from './sudokupad/utilities';
import { convertPuzzleAsync } from './puzzle-link-converter';
import { Testing } from './testing';
import { AppVersion } from './appversion';
import { ConverterFlags, type FlagName, type FlagValues } from './converter-flags';
import { ConverterError } from './converter-error';

setAppVersion();

// const sudoku6x6_square_nosol =
// 'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VVPb5tOFLz7U1h73oP5szjhlqZJL4l/TeMqipAVrR2SWMYmXeCXCMvfPfMeJCyYqmqrqjlUiNUwPGbnLcySfSu0iWWAwzuQI+ngcIOAT8f3+RzVx3SZJ3E4nMZZPgyeA3lU5A+pCYfn2qzAru70RspJOjRFEmfyv9NTeaeTLB5EtcBssC0Pw/JClp/CSDhCChenI2ayvAi35XlYTmR5iVtCOuDOqiIX8KSBV3yf0HFFOiPgSY0BrwEXS7NI4puzivkcRuVUCprnAz9NUKzT/2NR+6DrRbqeL4mY6xx9Zg/Lx/pOVtymq6KudWY7WR5Vdi977HqNXYKVXUI9dqmLP2z3cLbbYdm/wPBNGJH3rw08aOBluMU4CbfCdelRBS/VuxFuQETQEJ5HhG8R6nVxXokxEV5D+CxqVfh+t4JnsUQVV+ALeSO4wtII2IdN8COWRsDGLOsBG7OaG7OGVTHmR940sCgOL801j6c8ujxOsXKy9Hj8yOOIR8XjGdecYEEdBzFyYc2Fogvs1djjeFWYokYdE1bA1ArhAHj8Wo9welhIxi4wvDP22pr0OhgrYCwaY8SZ3grrQ0fVOgo6qtZR0LE9qFpHQYcWnzF0FOmguStu8ZhHn8eAWx/TJ/VTH93vr/IP7UQuOn070NGv4tkgwkYmsjS5yQpzpxeIJe9zSB64TbGex6ZFJWn6mCw37brl/SY1ce8tIuPb+776eWpuO+pPOklaRLWlt6hqg2lRucHuYV1rY9KnFrPW+UOLsHaallK8ydsGct22qFe6M9u66Xk3EM+Cz8ijH9C/38Tf+k3QOxi9t9y+Nzv8+aamN/uge+IPtjfmNb+XdPB7maYJ92MNtifZYLvhBrWfb5B7EQf3nZSTajfo5KqbdZpqL+40lZ147KCMXgA=';

// import { PenpaLoader } from './penpa-loader/penpa-loader';
// import { PenpaAnalyzer } from './penpa-analyzer';
// {
// 	let pu = PenpaLoader.loadPenpaPuzzle(sudoku6x6_square_nosol)!;
// 	let { puinfo } = PenpaAnalyzer.preparePenpaPuzzle(pu);
// 	console.log(puinfo);
// }

export function setError(errormessage: string) {
	console.log('ERROR: ', errormessage);
	document.querySelector<HTMLElement>('#errortext')!.innerHTML = errormessage;
	let element = document.querySelector<HTMLDivElement>('#errorcontainer')!;
	element.classList.remove('error');
	// https://stackoverflow.com/questions/60686489/what-purpose-does-void-element-offsetwidth-serve
	void element.offsetWidth; // trigger a DOM reflow to retrigger animation
	element.classList.add('error');
}

function clearError() {
	document.querySelector<HTMLElement>('#errortext')!.innerHTML = '';
	document.querySelector<HTMLDivElement>('#errorcontainer')!.classList.remove('error');
}

const buttonLoadFileElem = document.querySelector<HTMLButtonElement>('#btnloadfile')!;
const inputUrlElem = document.querySelector<HTMLTextAreaElement>('#input-url')!;
const clearButtonElem = document.querySelector<HTMLButtonElement>('#btnClear')!;
const selectActionElem = document.querySelector<HTMLSelectElement>('#select-action')!;
const convertButtonElem = document.querySelector<HTMLButtonElement>('#btnconvert')!;
const buttonCopyUrlElem = document.querySelector<HTMLButtonElement>('#btncopyurl')!;

const selectDestinationElem = document.querySelector<HTMLSelectElement>('#select-destination')!;
const generatedUrlElem = document.querySelector<HTMLTextAreaElement>('#generated-url')!;
const generatedUrlSectionElem = document.querySelector<HTMLDivElement>('#generated-url-section')!;
const urlIsCopiedElem = document.querySelector<HTMLLabelElement>('#urlIsCopied')!;
const fileDropAreaElem = document.querySelector<HTMLDivElement>('.penpa')!;

if (document.readyState !== 'complete') {
	window.addEventListener('DOMContentLoaded', doInitialize);
} else {
	// `DOMContentLoaded` has already fired
	doInitialize();
}

function doInitialize() {
	buttonLoadFileElem.onclick = OnLoadFromFile;
	inputUrlElem.oninput = OnInputURLChange;
	clearButtonElem.onclick = OnClearInputURL;
	selectActionElem.onchange = OnSelectActionChange;
	convertButtonElem.onclick = () => OnConvert();
	buttonCopyUrlElem.onclick = OnCopyUrl;

	let appString = `${AppVersion.getAppTitle()}  (&copy; 2023-${new Date().getFullYear()})`;
	document.querySelectorAll('#menu-app-version').forEach(elem => (elem.innerHTML = appString));

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const url = urlParams.get('url');
	const hash = window.location.hash;
	if (hash) {
		inputUrlElem.value = hash.substring(1);
		OnConvert(true);
	} else if (url) {
		inputUrlElem.value = decodeURIComponent(url);
		OnInputURLChange();
	}
	inputUrlElem.focus();

	// On app reactivate inputUrlElem.value is not always immediatly available
	setTimeout(OnInputURLChange, 100);

	setMenuSetting('options-show-options', localStorage.showOptions);

	createSettings(document.querySelector<HTMLElement>('.importer-options')!, urlParams.get('test'));

	addFileDragNDrop(fileDropAreaElem);

	createAppMenu();

	Testing.init(addDestination);

	function getDefaultFlags() {
		let converterFlags = new ConverterFlags();
		// Parse URL settings
		[...new URLSearchParams(document.location.search)].forEach(([key, val]) => {
			let settingName = key.replace(/^setting-/, '');
			// Make case insentitive
			settingName = Object.keys(converterFlags.getFlagValues()).reduce(
				(prev, cur) => (prev.toLowerCase() === cur.toLowerCase() ? cur : prev),
				settingName
			);
			const settingValueTrue = ['true', 't', '1', ''].includes(val.toLowerCase());
			const settingValueFalse = ['false', 'f', '0'].includes(val.toLowerCase());
			const settingValue = settingValueTrue ? true : settingValueFalse ? false : val;
			if (converterFlags.getValue(settingName) === undefined) {
				console.info(`Extra URL option: ${settingName}=${settingValue}`);
			} else {
				console.info(`Extra URL setting: ${settingName}=${settingValue}`);
			}
			converterFlags.setValue(settingName, settingValue);
		});
		return converterFlags;
	}

	function createSettings(parent: HTMLElement, test: string | null) {
		let converterFlags = getDefaultFlags();

		// Create UI elements
		let descriptions = ConverterFlags.FlagDescriptions();
		for (let name in descriptions) {
			const flag = descriptions[name as FlagName];
			if (!flag.hidden) {
				// Produces:
				// <div>
				// 	<input type="checkbox" id="thickLines" name="thickLines">
				// 	<label for="thickLines">Thicken lines to match Sudokupad feature lines</label>
				// </div>
				let divElem = document.createElement('div');
				let inputElem = document.createElement('input');
				inputElem.type = 'checkbox';
				inputElem.id = name;
				inputElem.name = name;
				inputElem.checked = converterFlags.getValue(name);

				// Auto enable 'debug' flag when in development mode
				if (name === 'debug' && import.meta.env.DEV) {
					inputElem.checked = true;
				}

				let labelElem = document.createElement('label');
				labelElem.htmlFor = name;
				labelElem.innerText = flag.title;
				divElem.appendChild(inputElem);
				divElem.appendChild(labelElem);
				parent.appendChild(divElem);
			}
		}

		// Show settings when in test mode.
		if (test !== null) {
			parent.classList.toggle('show', true);
		}
	}

	function addFileDragNDrop(dropArea: HTMLElement) {
		// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_events
		['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
			dropArea.addEventListener(eventName, preventDefaults, false);
		});

		function preventDefaults(e: any) {
			e.preventDefault();
			e.stopPropagation();
		}

		['dragenter', 'dragover'].forEach(eventName => {
			dropArea.addEventListener(eventName, highlight, false);
		});

		['dragleave', 'drop'].forEach(eventName => {
			dropArea.addEventListener(eventName, unhighlight, false);
		});

		let dropdelaytimer: ReturnType<typeof setTimeout> | undefined = undefined;
		function highlight(_e: any) {
			dropArea.classList.add('drophover');
			if (dropdelaytimer) clearTimeout(dropdelaytimer);
			dropdelaytimer = null!;
		}

		function unhighlight(_e: any) {
			dropdelaytimer = setTimeout(() => {
				dropArea.classList.remove('drophover');
			}, 80);
		}

		dropArea.addEventListener('drop', handleDrop, false);

		function handleDrop(e: any) {
			clearError();
			const dt = e.dataTransfer;
			for (let type of dt.types) {
				// console.log({ type, data: dt.getData(type) });
				if (type === 'Files') {
					handleLoadFromFile(dt.files[0]);
					break;
				} else if (type.startsWith('text/')) {
					inputUrlElem.value = dt.getData(type);
					OnInputURLChange();
					generatedUrlElem.value = '';
					break;
				}
			}
		}
	}
}

function toBool(value: any) {
	if (typeof value === 'string' && value.length !== 0) {
		return value[0] === 't';
	}
	return !!value;
}

let lastActionSelection = 'open'; // default action

const reUrl = /^(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const reJSON = /^[\s'"]*\{/;

function handleLoadFromFile(file: any) {
	if (file.size > 60000) {
		setError(`File '${file.name}' is too large`);
		return;
	}
	const reader = new FileReader();
	reader.onload = function (event: any) {
		let result = event.target.result;
		if (result.match(reUrl) || result.match(reJSON)) {
			inputUrlElem.value = result;
			OnInputURLChange();
			generatedUrlElem.value = '';
		} else {
			setError(`File '${file.name}' does not contain JSON or URL`);
		}
	};
	reader.readAsText(file);
}

function OnInputURLChange() {
	clearError();
	let urlstring = inputUrlElem.value.trim();
	clearButtonElem.classList.toggle('hidden', urlstring.length === 0);
}
function OnClearInputURL() {
	inputUrlElem.value = '';
	OnInputURLChange();
	inputUrlElem.focus();
}

function OnSelectActionChange(e: any) {
	const value = (e.target?.value as string) ?? e ?? '';
	let showUrl = value.startsWith('create');
	generatedUrlSectionElem.classList.toggle('visible', showUrl);
	if (!value.includes('json')) {
		lastActionSelection = value;
	}
}

const destinations = ['https://sudokupad.app/', 'https://beta.sudokupad.app/', 'https://alpha.sudokupad.app/', 'https://app.crackingthecryptic.com/'];

function addDestination(urlPrefix: string) {
	let option = document.createElement('option');
	option.value = urlPrefix;
	option.innerHTML = urlPrefix.match(/(?:https?:\/\/)?([^\/]+)/)![1];
	selectDestinationElem.appendChild(option);
}

destinations.forEach(addDestination);

let destination = localStorage.destination;
selectDestinationElem.value = destination;
if (selectDestinationElem.value !== destination) {
	selectDestinationElem.selectedIndex = 0;
}

Swal.handler = (opts: any) => {
	setError(opts.html);
};

const reFPuzPrefix = /^(fpuz(?:zles)?)(.*)/;
const stripFPuzPrefix = (fpuzzle: string) => fpuzzle.replace(reFPuzPrefix, '$2');

// function getPenpaDecoderOptions() {
// 	let options = document.querySelectorAll<HTMLInputElement>('fieldset input[type=checkbox]');
// 	for (let option of options) {
// 		ConverterSettings.flags[option.name] = option.checked;
// 	}
// }
function getPenpaDecoderOptions() {
	let options = document.querySelectorAll<HTMLInputElement>('fieldset input[type=checkbox]');
	let flags = {} as any;
	for (let option of options) {
		flags[option.name] = option.checked;
	}
	return flags as FlagValues;
}

async function OnConvert(redirect = false) {
	let destination = selectDestinationElem.value;
	if (!destination.includes('crackingthecryptic')) {
		localStorage.destination = destination;
	}

	convertButtonElem.disabled = true;
	convertButtonElem.innerHTML = 'Converting...';

	let input = inputUrlElem.value.trim();

	try {
		const flags = getPenpaDecoderOptions();

		let puzzleId = await convertPuzzleAsync(input, flags);

		if (puzzleId === undefined) {
			throw new ConverterError('Not a recognized puzzle URL');
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

		switch (selectActionElem.value) {
			case 'create-url':
				{
					generatedUrlElem.value = newUrl;
					generatedUrlElem.select();
					generatedUrlElem.focus();
					buttonCopyUrlElem.disabled = !newUrl;
				}
				break;

			case 'create-tinyurl':
				{
					generatedUrlElem.value = '';
					generatedUrlElem.placeholder = '...Creating TinyPuz URL...';
					let shortUrl = await request_tinypuz_shortlink(newUrl);
					if (shortUrl) {
						generatedUrlElem.value = shortUrl;
						generatedUrlElem.select();
						generatedUrlElem.focus();
					} else {
						generatedUrlElem.value = 'Error while creating TinyPuz URL';
					}
					buttonCopyUrlElem.disabled = !newUrl;
				}
				break;

			case 'convert-tojson':
				{
					const stringify = (obj: any) => stringifyPretty(obj, { maxLength: 150 });

					generatedUrlElem.value = '';
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
							let fpuzzle = JSON.parse(loadFPuzzle.decompressPuzzle(decodedUrl)!);
							inputUrlElem.value = stringify(fpuzzle);
						} catch (err) {
							console.error(err);
							setError('Not a recognized F-Puzzle format');
							return;
						}
					} else {
						let puzzle = await parsePuzzleData(puzzleId);
						inputUrlElem.value = stringify(puzzle);
					}

					generatedUrlElem.value = '';
					if (lastActionSelection) {
						selectActionElem.value = lastActionSelection;
						OnSelectActionChange(lastActionSelection);
					}
				}
				break;

			default: {
				window.open(newUrl, '_blank');
				return;
			}
		}
	} catch (err) {
		console.error(err);
		if (err instanceof ConverterError) {
			setError(err.message);
		} else {
			setError('An error occured while processing the URL.<br>');
		}
	} finally {
		convertButtonElem.disabled = false;
		convertButtonElem.innerHTML = 'Convert URL';
	}
}

function OnLoadFromFile() {
	loadFromFile(handleLoadFromFile, { accept: '.json, .txt' });
}

function OnCopyUrl() {
	navigator.clipboard.writeText(generatedUrlElem.value);
	// Retrigger animation
	urlIsCopiedElem.classList.remove('animation');
	void urlIsCopiedElem.offsetWidth; // trigger a DOM reflow
	urlIsCopiedElem.classList.add('animation');
}

async function request_tinypuz_shortlink(url: string) {
	try {
		let res = await fetch('https://tinyurl.com/api-create.php?url=' + url);
		let text = (await res.text()) || '';
		return text.replace('tinyurl.com', 'tinypuz.com');
	} catch (err) {
		console.error('Error while creating TinyPuz URL', err);
		return null;
	}
}

function setAppVersion() {
	let titleElem = document.querySelector('title')!;
	titleElem.innerHTML = AppVersion.getAppTitle();

	let appTitleElem = document.querySelector('#appTitle')!;
	appTitleElem.innerHTML = AppVersion.getAppTitle();
}

//
// APP Menu
//
function createAppMenu() {
	const closeMenu = (event: any) => {
		document.querySelector('#appmenu')!.classList.toggle('open');
		removeDownEventHandler('#appmenu.mdc-drawer', handleClickOverlay);
		if (event) event.preventDefault(); // Prevent click-throughs on buttons
	};

	const handleOpenAppMenu = (_event: any) => {
		document.querySelector('#appmenu')!.classList.toggle('open');
		addDownEventHandler('#appmenu.mdc-drawer', handleClickOverlay);
	};

	const handleClickOverlay = (event: any) => {
		event.stopPropagation();
		event.stopImmediatePropagation();
		if (event.target === document.querySelector('#appmenubtn')) return;
		if (event.target === document.querySelector('#appmenu')) closeMenu(event);
	};

	const handleClickOption = (event: any) => {
		if (!event.target) return;
		setMenuSetting('options-show-options', event.target.checked);
	};

	addHandler('#appmenubtn', 'click', handleOpenAppMenu, { capture: true });
	addHandler('#options-show-options', 'click', handleClickOption, { capture: true });
}

function setMenuSetting(setting: string, value: unknown) {
	let settingCheckbox = document.querySelector<HTMLInputElement>('#' + setting)!;

	switch (setting) {
		case 'options-show-options':
			{
				let checked = toBool(value);
				settingCheckbox.checked = checked;
				localStorage.showOptions = checked;
				let importerOptions = document.querySelector<HTMLElement>('.importer-options')!;
				importerOptions.classList.toggle('show', checked);
			}
			break;
	}
}
