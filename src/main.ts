import stringifyPretty from 'json-stringify-pretty-compact';
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder.js';
import { PuzzleLoader } from './sudokupad/puzzleloader.js';
import { Swal } from './Swal';
import { addHandler, addDownEventHandler, removeDownEventHandler, loadFromFile } from './sudokupad/utilities.js';
import { convertPuzzleAsync } from './puzzle-link-converter';
import { Testing } from './testing.js';
import { AppVersion } from './appversion.js';
import { ConverterSetting, ConverterSettings, FlagName, Flags } from './converter-settings';

setAppVersion();

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

	function createSettings(fieldset: HTMLElement, test: string | null) {
		// Initialize Setting
		let settings = ConverterSettings.settings;
		for (let name of Object.keys(settings) as Array<FlagName>) {
			const setting = settings[name] as ConverterSetting;
			if (!setting.hidden) {
				// <div>
				// 	<input type="checkbox" id="thickLines" name="thickLines">
				// 	<label for="thickLines">Thicken lines to match Sudokupad feature lines</label>
				// </div>
				let divElem = document.createElement('div');
				let inputElem = document.createElement('input');
				inputElem.type = 'checkbox';
				inputElem.id = name;
				inputElem.name = name;

				let labelElem = document.createElement('label');
				labelElem.htmlFor = name;
				labelElem.innerText = setting.title;
				divElem.appendChild(inputElem);
				divElem.appendChild(labelElem);
				fieldset.appendChild(divElem);
			}
			ConverterSettings.flags[name] = setting.defaultValue;
		}

		// Show settings in test mode.
		if (test !== null) {
			fieldset.classList.toggle('show', true);
		}

		ConverterSettings.ParseUrlSettings();

		let options = document.querySelectorAll<HTMLInputElement>('fieldset input[type=checkbox]');
		for (let option of options) {
			option.checked = ConverterSettings.getFlag(option.name) || false;
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

		let dropdelaytimer: number = null!;
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
	const value = (e.target?.value as string) ?? '';
	let showUrl = value.startsWith('create');
	generatedUrlSectionElem.classList.toggle('visible', showUrl);
	if (!value.includes('json')) {
		lastActionSelection = value;
	}
}

const destinations = ['https://sudokupad.app/', 'https://beta.sudokupad.app/', 'https://alpha.sudokupad.app/'];

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
	return flags as Flags;
}

async function OnConvert(redirect = false) {
	let destination = selectDestinationElem.value;
	localStorage.destination = destination;

	convertButtonElem.disabled = true;
	convertButtonElem.innerHTML = 'Converting...';

	let input = inputUrlElem.value.trim();

	try {
		ConverterSettings.setFlags(getPenpaDecoderOptions());

		let puzzleId = await convertPuzzleAsync(input);

		if (puzzleId === undefined) {
			throw { customMessage: 'Not a recognized puzzle URL' };
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
					puzzleId = puzzleId.split('&')[0]; // Strip off parameters (settings)
					if (isRemotePuzzleId(puzzleId)) {
						try {
							// expand short puzzleid
							puzzleId = await fetchPuzzle(puzzleId);
							if (!puzzleId || isRemotePuzzleId(puzzleId)) {
								throw { customMessage: 'Not a recognized JSON puzzle format' };
							}
						} catch (err) {
							console.error(err);
							throw { customMessage: 'Short puzzle ID not found' };
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
	} catch (err: any) {
		console.error(err);
		setError(err.customMessage || 'An error occured while processing the URL.<br>');
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