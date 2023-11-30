function setError(errormessage) {
    console.log('ERROR: ', errormessage);
    document.getElementById('errortext').innerHTML = errormessage;
    let element = document.getElementById('errorcontainer')
    element.classList.remove('error');
    // https://stackoverflow.com/questions/60686489/what-purpose-does-void-element-offsetwidth-serve
    void element.offsetWidth; // trigger a DOM reflow to retrigger animation
    element.classList.add('error');
}
function clearError() {
    document.getElementById('errortext').innerHTML = '';
    document.getElementById('errorcontainer').classList.remove('error');
}

const camelize = s => s.replace(/-./g, x=>x[1].toUpperCase())

const inputUrlElem = document.getElementById('input-url');
const selectDestinationElem = document.getElementById('select-destination');
const buttonCopyUrlElem = document.getElementById('btncopyurl');
const generatedUrlElem = document.getElementById('generated-url');
const generatedUrlSectionElem = document.getElementById('generated-url-section');
const convertButtonElem = document.getElementById('btnconvert');
const selectActionElem = document.getElementById('select-action');
const urlIsCopiedElem = document.getElementById('urlIsCopied');
const clearButtonElem = document.querySelector('.textarea-container button');
const fileDropAreaElem = document.querySelector('.penpa');

if (document.readyState !== 'complete') {
    window.addEventListener('DOMContentLoaded', doInitialize);
} else {
    // `DOMContentLoaded` has already fired
    doInitialize();
}

function doInitialize() {

    let appString = `Sudokupad Penpa+ importer v${appVersion}  (&copy; 2023)`;
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

    createSettings(document.querySelector('.importer-options'), urlParams.get('test'));
    PenpaDecoder.ParseUrlSettings();
    let options = document.querySelectorAll('fieldset input[type=checkbox]');
    for(let option of options) {
        option.checked = PenpaDecoder.flags[option.name] ? true : false;
    }

    addFileDragNDrop(fileDropAreaElem);

    createAppMenu();

    function createSettings(fieldset, test) {
        // Initialize Setting
        let settings = PenpaDecoder.settings;
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

            PenpaDecoder.flags[setting] = settings[setting].defaultValue;
        });
        // Show settings in test mode.
        if (test !== null) {
            fieldset.classList.toggle('show', true);
        }
    }

    function addFileDragNDrop(dropArea) {
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        });

        let dropdelaytimer = null;
        function highlight(e) {
            dropArea.classList.add('drophover')
            if (dropdelaytimer) clearTimeout(dropdelaytimer);
            dropdelaytimer = null;
        }

        function unhighlight(e) {
            dropdelaytimer = setTimeout(()=>{
                dropArea.classList.remove('drophover');
            }, 80);
        }

        dropArea.addEventListener('drop', handleDrop, false)

        function handleDrop(e) {
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

function toBool(value) {
    if (typeof value === 'string' && value.length !== 0) {
        return value[0] === 't';
    }
    return !!value;
}

function setMenuSetting(setting, value) {
    let settingCheckbox = document.getElementById(setting);

    switch(setting) {
        case 'options-show-options': {
            let checked = toBool(value);
            settingCheckbox.checked = checked;
            localStorage.showOptions = checked;
            let importerOptions = document.querySelector('.importer-options');
            importerOptions.classList.toggle('show', checked);
        } break;
    }

}

let lastActionSelection = 'open'; // default action

const reUrl = /^(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const reJSON = /^[\s'"]*\{/;
function handleLoadFromFile(file) {
    if (file.size > 60000) {
        setError(`File '${file.name}' is too large`);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
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

function OnSelectActionChange(value) {
    showUrl = value.startsWith('create');
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

function addDestination(urlPrefix) {
    let option = document.createElement('option');
    option.value = urlPrefix;
    option.innerHTML = urlPrefix.match(/(?:https?:\/\/)?([^\/]+)/)[1]
    selectDestinationElem.appendChild(option);
}

destinations.forEach(addDestination);

let destination = localStorage.destination;
selectDestinationElem.value = destination;
if (selectDestinationElem.value !== destination) {
    selectDestinationElem.selectedIndex = 0;
}

// Stub to capture messages
const Swal = {
    fire: function(opts) {
        setError(opts.html);
    }
}

const reFPuzPrefix = /^(fpuz(?:zles)?)(.*)/;
const stripFPuzPrefix = fpuzzle => fpuzzle.replace(reFPuzPrefix, '$2');

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
                const {stringify} = JsonStringifyPrettyCompact;
                const stringifyPretty = (obj) => stringify(obj, {maxLength: 150});
                generatedUrlElem.value = '';
                const {isRemotePuzzleId, parsePuzzleData, fetchPuzzle} = PuzzleLoader;
                let raw = puzzleid;
                puzzleid = puzzleid.split('&')[0];

                if(isRemotePuzzleId(puzzleid)) {
                    try {
                        puzzleid = await fetchPuzzle(puzzleid);
                        if(isRemotePuzzleId(puzzleid)) {
                            throw {customMessage: 'Not a recognized JSON puzzle format'};
                        }
                    }
                    catch(err) {
                        throw {customMessage: 'Short puzzle ID not found'};
                    }
                }
                if (reFPuzPrefix.test(puzzleid)) {
                    let fpuzzle = loadFPuzzle.saveDecodeURIComponent(stripFPuzPrefix(puzzleid));
                    if(typeof fpuzzle === 'string') {
                        try {
                            fpuzzle = JSON.parse(loadFPuzzle.decompressPuzzle(fpuzzle));
                            inputUrlElem.value = stringifyPretty(fpuzzle);
                        }
                        catch {
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

async function request_tinypuz_shortlink(url) {
    try {
        let res = await fetch('https://tinyurl.com/api-create.php?url=' + url);
        let text = await res.text() || '';
        return text.replace('tinyurl.com', 'tinypuz.com');
    } catch (error) {
        console.log('Error while creating TinyPuz URL');
        return null;
    }
}

function createAppMenu() {
	const closeMenu = event => {
		document.querySelector('#appmenu').classList.toggle('open');
        removeDownEventHandler('#appmenu.mdc-drawer', handleClickOverlay);
        if(event) event.preventDefault(); // Prevent click-throughs on buttons
	};
	const handleClickOverlay = event => {
		event.stopPropagation();
		event.stopImmediatePropagation();
		if(event.target === document.querySelector('#appmenubtn')) return
		if(event.target === document.querySelector('#appmenu')) closeMenu(event);
	};
	const handleClickOption = event => {
        if (!event.target) return;
        setMenuSetting('options-show-options', event.target.checked);
	};
	const handleOpenAppMenu = event => {
		document.querySelector('#appmenu').classList.toggle('open');
		addDownEventHandler('#appmenu.mdc-drawer', handleClickOverlay);
	};
	addHandler('#appmenubtn', 'click', handleOpenAppMenu, {capture: true});
    addHandler('#options-show-options', 'click', handleClickOption, {capture: true});
    //handleOpenAppMenu();
}
