import { PenpaConverter } from './penpa-converter'
//import { PenpaLoader } from './penpa-loader/penpa-loader'
import stringify from 'json-stringify-pretty-compact'
import { loadFPuzzle } from './sudokupad/fpuzzlesdecoder.js'
import { PuzzleLoader } from './sudokupad/puzzleloader.js';
import { Swal } from './Swal';
import { addHandler, addDownEventHandler, removeDownEventHandler, loadFromFile } from './sudokupad/utilities.js';
import { puzzleLinkConverter } from './puzzle-link-converter.js';
import { Testing } from './testing.js';
import { AppVersion } from './appversion.js';

setAppVersion();

// let url = 'https://swaroopg92.github.io/penpa-edit/#m=edit&p=7VRdb9owFH3nV0x+9gP5bPBb15W9sG4dTFVlIRQgLVED7pxknYL47z2+ThVCMqnaNK0Pk+XLybk3vsfEx/n3MtYJDzG8iA+5g+GGIU3H92kO6zFLiywR7/h5WWyUBuD883jM7+IsTwayrpoP9tVIVNe8+igkcxhnLqbD5ry6Fvvqk6gmvJoixXgIbmKLIsBLC13AG8obdGFJZwh8VWPAW8BVqldZsphY5ouQ1Ywz0+c9vW0g26ofCat1mOeV2i5TQyzjApvJN+ljncnLtXoo61pnfuDVuZU7fZFrutRyvUaugVauQT1yzS7+stzR/HDA3/4VghdCGu3fGhg1cCr2zPOYcDnzfCYC/ARMhMhcIeMjI9kI+uz3Yj5qJIsaIkC1ZGcvBN5zxB7xluKYoktxhoa88ih+oDikGFCcoFvg8gANI6zq8dCiEAg9IyxwScvcULyg6FMMaYEzs59X7tju7k+0vlKOdF2yjx3B7+P5QMJFLFfZIi/1XbzCmSCT4bOD25XbZaJbVKbUY5bu2nXp/U7ppDdlyGR931e/VHp9svpTnGUtwl4aLcqe7hZVaBzdo+dYa/XUYrZxsWkRR8e8tVKyK9oCirgtMX6IT7ptmz0fBuwnoyk9c8X9v6P+1R1lvsHwrfn2rcmh46t0r/dB99gfbK/Na77jdPAdT5uGXVuD7XE22FNzg+r6G2TH4uB+4XKz6qnRjapTr5tWHbubVseOxw1K6Bk='
// let pu  = PenpaLoader.loadPenpaPuzzle(url);
// let sp = PenpaConverter.convertPenpaPuzzle(pu);
// console.log(sp);

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
  convertButtonElem.onclick = () => OnOpenInSudokupad();
  buttonCopyUrlElem.onclick = OnCopyUrl;
  
  let appString = `${AppVersion.getAppTitle()}  (&copy; 2023-${new Date().getFullYear()})`;
  document.querySelectorAll('#menu-app-version').forEach(elem => elem.innerHTML = appString);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const url = urlParams.get('url')
  const hash = window.location.hash;
  if (hash) {
      inputUrlElem.value = hash.substring(1);
      OnOpenInSudokupad(false);
  }
  else if (url) {
      inputUrlElem.value = decodeURIComponent(url);
      OnInputURLChange();
  }
  inputUrlElem.focus();

  // On app reactivate inputUrlElem.value is not always immediatly available
  setTimeout(OnInputURLChange, 100);

  setMenuSetting('options-show-options', localStorage.showOptions);

  createSettings(document.querySelector<HTMLElement>('.importer-options')!, urlParams.get('test'));
  PenpaConverter.ParseUrlSettings();
  let options = document.querySelectorAll<HTMLInputElement>('fieldset input[type=checkbox]');
  for(let option of options) {
      option.checked = PenpaConverter.flags[option.name] ? true : false;
  }

  addFileDragNDrop(fileDropAreaElem);

  createAppMenu();

  Testing.init(addDestination);

  function createSettings(fieldset: HTMLElement, test: string | null) {
      // Initialize Setting
      let settings = PenpaConverter.settings;
      Object.keys(settings).forEach(setting => {
          // <div>
          // 	<input type="checkbox" id="thickLines" name="thickLines">
          // 	<label for="thickLines">Thicken lines to match Sudokupad feature lines</label>
          // </div>
          let divElem = document.createElement('div');
          let inputElem =  document.createElement('input');
          inputElem.type = 'checkbox';
          inputElem.id = setting;
          inputElem.name = setting;

          let labelElem =  document.createElement('label');
          labelElem.htmlFor = setting;
          labelElem.innerText = settings[setting].title;
          divElem.appendChild(inputElem);
          divElem.appendChild(labelElem);
          fieldset.appendChild(divElem);

          PenpaConverter.flags[setting] = settings[setting].defaultValue;
      });
      // Show settings in test mode.
      if (test !== null) {
          fieldset.classList.toggle('show', true);
      }
  }

  function addFileDragNDrop(dropArea: HTMLElement) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_events
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropArea.addEventListener(eventName, preventDefaults, false)
      });

      function preventDefaults(e: any) {
          e.preventDefault();
          e.stopPropagation();
      }

      ['dragenter', 'dragover'].forEach(eventName => {
          dropArea.addEventListener(eventName, highlight, false)
      });

      ['dragleave', 'drop'].forEach(eventName => {
          dropArea.addEventListener(eventName, unhighlight, false)
      });

      let dropdelaytimer:number = null!;
      function highlight(_e: any) {
          dropArea.classList.add('drophover')
          if (dropdelaytimer) clearTimeout(dropdelaytimer);
          dropdelaytimer = null!;
      }

      function unhighlight(_e: any) {
          dropdelaytimer = setTimeout(()=>{
              dropArea.classList.remove('drophover');
          }, 80);
      }

      dropArea.addEventListener('drop', handleDrop, false)

      function handleDrop(e: any) {
          clearError();
          const dt = e.dataTransfer;
          for (let type of dt.types) {
              // console.log({ type, data: dt.getData(type) });
              if (type === 'Files') {
                  handleLoadFromFile(dt.files[0]);
                  break;
              }
              else if (type.startsWith('text/')) {
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
  reader.onload = function(event: any) {
      let result = event.target.result;
      if (result.match(reUrl) || result.match(reJSON)) {
          inputUrlElem.value = result;
          OnInputURLChange();
          generatedUrlElem.value = '';
      }
      else {
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
  const value = e.target?.value as string ?? '';
  let showUrl = value.startsWith('create');
  generatedUrlSectionElem.classList.toggle('visible', showUrl);
  if (!value.includes('json')) {
      lastActionSelection = value;
  }
}

const destinations = [
  'https://sudokupad.app/',
  'https://beta.sudokupad.app/',
  'https://alpha.sudokupad.app/',
]

function addDestination(urlPrefix: string) {
  let option = document.createElement('option');
  option.value = urlPrefix;
  option.innerHTML = urlPrefix.match(/(?:https?:\/\/)?([^\/]+)/)![1]
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
}

const reFPuzPrefix = /^(fpuz(?:zles)?)(.*)/;
const stripFPuzPrefix = (fpuzzle: string) => fpuzzle.replace(reFPuzPrefix, '$2');

function OnOpenInSudokupad(openinNewWindow = true) {
  let destination = selectDestinationElem.value;
  localStorage.destination = destination;

  let urlstring = inputUrlElem.value.trim();

  let param = urlstring.substring(urlstring.indexOf('&') + 1);
  if (param.length === 0)
      return;

  convertButtonElem.disabled = true;
  convertButtonElem.innerHTML = "Converting...";

  Promise.resolve(urlstring)
  .then(url => puzzleLinkConverter.expandTinyUrl(url))
  .then(url => puzzleLinkConverter.convertPuzzleUrl(url))
  .then(async puzzleid => {
      if (!puzzleid) {
          throw {customMessage: 'Not a recognized puzzle URL'};
      }
      if (destination.includes('?')) {
          puzzleid = puzzleid.replace('?', '&');
      }
      let redirect = destination + puzzleid;
      console.log(redirect, redirect.length);

      if (!openinNewWindow) {
          window.open(redirect, '_self');
          return;
      }

      switch(selectActionElem.value)
      {
          case 'create-url': {
              generatedUrlElem.value = redirect;
              generatedUrlElem.select();
              generatedUrlElem.focus();
              buttonCopyUrlElem.disabled = !redirect;
          } break;

          case 'create-tinyurl': {
              generatedUrlElem.value = '';
              generatedUrlElem.placeholder = '...Creating TinyPuz URL...';
              let newUrl = await request_tinypuz_shortlink(redirect);
              generatedUrlElem.value = newUrl || 'Error while creating TinyPuz URL';
              if (newUrl) {
                  generatedUrlElem.select();
                  generatedUrlElem.focus();
              }
              buttonCopyUrlElem.disabled = !newUrl;
          } break;

          case 'convert-tojson': {
              const stringifyPretty = (obj: any) => stringify(obj, {maxLength: 150});
              generatedUrlElem.value = '';
              const {isRemotePuzzleId, parsePuzzleData, fetchPuzzle} = PuzzleLoader;
              //let raw = puzzleid;
              puzzleid = puzzleid.split('&')[0];

              if(isRemotePuzzleId(puzzleid)) {
                  try {
                      puzzleid = await fetchPuzzle(puzzleid);
                      if(isRemotePuzzleId(puzzleid)) {
                          throw {customMessage: 'Not a recognized JSON puzzle format'};
                      }
                  }
                  catch(err) {
                    console.error(err);
                      throw {customMessage: 'Short puzzle ID not found'};
                  }
              }
              if (reFPuzPrefix.test(puzzleid)) {
                  let fpuzzle = loadFPuzzle.saveDecodeURIComponent(stripFPuzPrefix(puzzleid));
                  if(typeof fpuzzle === 'string') {
                      try {
                          fpuzzle = JSON.parse(loadFPuzzle.decompressPuzzle(fpuzzle)!);
                          inputUrlElem.value = stringifyPretty(fpuzzle);
                      }
                      catch(err) {
                          console.error(err);
                          setError('Not a recognized JSON puzzle format');
                          return;
                      }
                  }
              }
              else {
                  let puzzle = await parsePuzzleData(puzzleid);
                  inputUrlElem.value = stringifyPretty(puzzle);
              }

              generatedUrlElem.value = '';
              if (lastActionSelection) {
                  selectActionElem.value = lastActionSelection;
                  OnSelectActionChange(lastActionSelection);
              }
          } break;

          default: {
              window.open(redirect, '_blank');
              return;
          }
      }
  })
  .catch(err => {
      console.error(err);
      setError(err.customMessage || 'An error occured while processing the URL.<br>');
  })
  .then(()=> {
      convertButtonElem.disabled = false;
      convertButtonElem.innerHTML = "Convert URL";
  });
}

function OnLoadFromFile() {
    console.log('load from file!');
    loadFromFile(handleLoadFromFile, {accept: '.json, .txt'});
}

function OnCopyUrl() {
    navigator.clipboard.writeText(generatedUrlElem.value);
    // Retrigger animation
    urlIsCopiedElem.classList.remove("animation");
    void urlIsCopiedElem.offsetWidth; // trigger a DOM reflow
    urlIsCopiedElem.classList.add("animation");
}

async function request_tinypuz_shortlink(url: string) {
    try {
        let res = await fetch('https://tinyurl.com/api-create.php?url=' + url);
        let text = await res.text() || '';
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
        if(event) event.preventDefault(); // Prevent click-throughs on buttons
    };

    const handleOpenAppMenu = (_event: any) => {
        document.querySelector('#appmenu')!.classList.toggle('open');
        addDownEventHandler('#appmenu.mdc-drawer', handleClickOverlay);
    };
    
    
    const handleClickOverlay = (event: any) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        if(event.target === document.querySelector('#appmenubtn')) return
        if(event.target === document.querySelector('#appmenu')) closeMenu(event);
    };

    const handleClickOption = (event: any) => {
    if (!event.target) return;
        setMenuSetting('options-show-options', event.target.checked);
    };

    addHandler('#appmenubtn', 'click', handleOpenAppMenu, {capture: true});
    addHandler('#options-show-options', 'click', handleClickOption, {capture: true});
}

function setMenuSetting(setting: string, value: any) {
    let settingCheckbox = document.querySelector<HTMLInputElement>('#' + setting)!;

    switch(setting) {
        case 'options-show-options': {
            let checked = toBool(value);
            settingCheckbox.checked = checked;
            localStorage.showOptions = checked;
            let importerOptions = document.querySelector<HTMLElement>('.importer-options')!;
            importerOptions.classList.toggle('show', checked);
        } break;
    }
}

