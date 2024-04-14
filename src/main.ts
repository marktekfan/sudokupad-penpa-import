import './style.css';
// import "./flags.css";

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

//import { createRouter, createWebHistory } from 'vue-router';
//import { routes } from '@/router';

// import PrimeVue, { usePrimeVue } from 'primevue/config';
//import 'primevue/resources/themes/aura-light-amber/theme.css'
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

{
	// import AutoComplete from 'primevue/autocomplete';
	// import Accordion from 'primevue/accordion';
	// import AccordionTab from 'primevue/accordiontab';
	// import AnimateOnScroll from 'primevue/animateonscroll';
	// import Avatar from 'primevue/avatar';
	// import AvatarGroup from 'primevue/avatargroup';
	// import Badge from 'primevue/badge';
	// import BadgeDirective from "primevue/badgedirective";
	// import BlockUI from 'primevue/blockui';
	// import Breadcrumb from 'primevue/breadcrumb';
	// import Calendar from 'primevue/calendar';
	// import Card from 'primevue/card';
	// import CascadeSelect from 'primevue/cascadeselect';
	// import Carousel from 'primevue/carousel';
	// import Chip from 'primevue/chip';
	// import Chips from 'primevue/chips';
	// import ColorPicker from 'primevue/colorpicker';
	// import Column from 'primevue/column';
	// import ColumnGroup from 'primevue/columngroup';
	// import ConfirmDialog from 'primevue/confirmdialog';
	// import ConfirmPopup from 'primevue/confirmpopup';
	// import ConfirmationService from 'primevue/confirmationservice';
	// import ContextMenu from 'primevue/contextmenu';
	// import DataTable from 'primevue/datatable';
	// import DataView from 'primevue/dataview';
	// import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
	// import DeferredContent from 'primevue/deferredcontent';
	// import Dialog from 'primevue/dialog';
	// import DialogService from 'primevue/dialogservice'
	// import Divider from 'primevue/divider';
	// import Dock from 'primevue/dock';
	// import DynamicDialog from 'primevue/dynamicdialog';
	// import FileUpload from 'primevue/fileupload';
	// import FocusTrap from 'primevue/focustrap';
	// import Galleria from 'primevue/galleria';
	// import Image from 'primevue/image';
	// import InlineMessage from 'primevue/inlinemessage';
	// import Inplace from 'primevue/inplace';
	// import InputGroup from 'primevue/inputgroup';
	// import InputGroupAddon from 'primevue/inputgroupaddon';
	// import InputMask from 'primevue/inputmask';
	// import InputNumber from 'primevue/inputnumber';
	// import Knob from 'primevue/knob';
	// import Listbox from 'primevue/listbox';
	// import MegaMenu from 'primevue/megamenu';
	// import Menubar from 'primevue/menubar';
	// import MultiSelect from 'primevue/multiselect';
	// import OrderList from 'primevue/orderlist';
	// import OrganizationChart from 'primevue/organizationchart';
	// import OverlayPanel from 'primevue/overlaypanel';
	// import Paginator from 'primevue/paginator';
	// import Panel from 'primevue/panel';
	// import PanelMenu from 'primevue/panelmenu';
	// import Password from 'primevue/password';
	// import PickList from 'primevue/picklist';
	// import ProgressBar from 'primevue/progressbar';
	// import ProgressSpinner from 'primevue/progressspinner';
	// import Rating from 'primevue/rating';
	// import RadioButton from 'primevue/radiobutton';
	// import Row from 'primevue/row';
	// import SelectButton from 'primevue/selectbutton';
	// import ScrollPanel from 'primevue/scrollpanel';
	// import ScrollTop from 'primevue/scrolltop';
	// import Skeleton from 'primevue/skeleton';
	// import Slider from 'primevue/slider';
	// import SpeedDial from 'primevue/speeddial';
	// import Splitter from 'primevue/splitter';
	// import SplitterPanel from 'primevue/splitterpanel';
	// import Steps from 'primevue/steps';
	// import TabMenu from 'primevue/tabmenu';
	// import TieredMenu from 'primevue/tieredmenu';
	// import TabView from 'primevue/tabview';
	// import TabPanel from 'primevue/tabpanel';
	// import Tag from 'primevue/tag';
	// import Terminal from 'primevue/terminal';
	// import Timeline from 'primevue/timeline';
	// import ToggleButton from 'primevue/togglebutton';
	// import Tree from 'primevue/tree';
	// import TreeSelect from 'primevue/treeselect';
	// import TreeTable from 'primevue/treetable';
	// import TriStateCheckbox from 'primevue/tristatecheckbox';
	// import VirtualScroller from 'primevue/virtualscroller';
	// import Ripple from 'primevue/ripple';
	// import StyleClass from 'primevue/styleclass';
	// import ThemeSwitcher from './components/ThemeSwitcher.vue';
	// import Configurator from './components/Configurator.vue';
	// import Lara from './presets/lara';
	// import Wind from './presets/wind';
	// import appState from './plugins/appState.js';
	// app.use(ConfirmationService);
	// app.use(DialogService);
	// app.use(router);
	// app.directive('badge', BadgeDirective);
	// app.directive('ripple', Ripple);
	// app.directive('styleclass', StyleClass);
	// app.directive('focustrap', FocusTrap);
	// app.directive('animateonscroll', AnimateOnScroll);
	// app.component('Accordion', Accordion);
	// app.component('AccordionTab', AccordionTab);
	// app.component('AutoComplete', AutoComplete);
	// app.component('Avatar', Avatar);
	// app.component('AvatarGroup', AvatarGroup);
	// app.component('Badge', Badge);
	// app.component('BlockUI', BlockUI);
	// app.component('Breadcrumb', Breadcrumb);
	// app.component('Calendar', Calendar);
	// app.component('Card', Card);
	// app.component('Carousel', Carousel);
	// app.component('CascadeSelect', CascadeSelect);
	// app.component('Chip', Chip);
	// app.component('Chips', Chips);
	// app.component('ColorPicker', ColorPicker);
	// app.component('Column', Column);
	// app.component('ColumnGroup', ColumnGroup);
	// app.component('ConfirmDialog', ConfirmDialog);
	// app.component('ConfirmPopup', ConfirmPopup);
	// app.component('ContextMenu', ContextMenu);
	// app.component('DataTable', DataTable);
	// app.component('DataView', DataView);
	// app.component('DataViewLayoutOptions', DataViewLayoutOptions);
	// app.component('DeferredContent', DeferredContent);
	// app.component('Dialog', Dialog);
	// app.component('Divider', Divider);
	// app.component('Dock', Dock);
	// app.component('DynamicDialog', DynamicDialog);
	// app.component('FileUpload', FileUpload);
	// app.component('Galleria', Galleria);
	// app.component('Image', Image);
	// app.component('InlineMessage', InlineMessage);
	// app.component('Inplace', Inplace);
	// app.component('InputGroup', InputGroup);
	// app.component('InputGroupAddon', InputGroupAddon);
	// app.component('InputMask', InputMask);
	// app.component('InputNumber', InputNumber);
	// app.component('Knob', Knob);
	// app.component('Listbox', Listbox);
	// app.component('MegaMenu', MegaMenu);
	// app.component('Menubar', Menubar);
	// app.component('MultiSelect', MultiSelect);
	// app.component('OrderList', OrderList);
	// app.component('OrganizationChart', OrganizationChart);
	// app.component('OverlayPanel', OverlayPanel);
	// app.component('Paginator', Paginator);
	// app.component('Panel', Panel);
	// app.component('PanelMenu', PanelMenu);
	// app.component('Password', Password);
	// app.component('PickList', PickList);
	// app.component('ProgressBar', ProgressBar);
	// app.component('ProgressSpinner', ProgressSpinner);
	// app.component('RadioButton', RadioButton);
	// app.component('Rating', Rating);
	// app.component('Row', Row);
	// app.component('SelectButton', SelectButton);
	// app.component('ScrollPanel', ScrollPanel);
	// app.component('ScrollTop', ScrollTop);
	// app.component('Slider', Slider);
	// app.component('Skeleton', Skeleton);
	// app.component('SpeedDial', SpeedDial);
	// app.component('Splitter', Splitter);
	// app.component('SplitterPanel', SplitterPanel);
	// app.component('Steps', Steps);
	// app.component('TabMenu', TabMenu);
	// app.component('TabView', TabView);
	// app.component('TabPanel', TabPanel);
	// app.component('Tag', Tag);
	// app.component('Terminal', Terminal);
	// app.component('TieredMenu', TieredMenu);
	// app.component('Timeline', Timeline);
	// app.component('ToggleButton', ToggleButton);
	// app.component('Tree', Tree);
	// app.component('TreeSelect', TreeSelect);
	// app.component('TreeTable', TreeTable);
	// app.component('TriStateCheckbox', TriStateCheckbox);
	// app.component('VirtualScroller', VirtualScroller);
	// app.component('ThemeSwitcher', ThemeSwitcher);q
	// app.component('Configurator', Configurator);
}

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

// PrimeVue
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Fieldset from 'primevue/fieldset';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
//import Message from 'primevue/message';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import SplitButton from 'primevue/splitbutton';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
//import Toast from 'primevue/toast';
import Toast from '@/components/ToastML.vue';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
// import AppInstance from '@/composables/useAppInstance';

app.use(PrimeVue, { unstyled: false });
app.use(ToastService);
// app.use(AppInstance);
// const router = createRouter({
// 	routes,
// 	//history: createWebHashHistory('/sudokupad-penpa-import/'),
// 	history: createWebHistory('/sudokupad-penpa-import/'),
// });

// app.use(router);

app.directive('tooltip', Tooltip);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('Dropdown', Dropdown);
app.component('Fieldset', Fieldset);
app.component('InputSwitch', InputSwitch);
app.component('InputText', InputText);
app.component('Menu', Menu);
// app.component('Message', Message);
app.component('Sidebar', Sidebar);
app.component('SplitButton', SplitButton);
app.component('Textarea', Textarea);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);

app.mount('#app');
=======
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
