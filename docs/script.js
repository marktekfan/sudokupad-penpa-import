function setError(errormessage) {
    document.getElementById('errortext').innerHTML = errormessage;
    let element = document.getElementById('errorcontainer')
    element.classList.remove('error');
    void element.offsetWidth; // trigger a DOM reflow to retrigger animation
    element.classList.add('error');
}
function clearError() {
    document.getElementById('errortext').innerHTML = '';
    document.getElementById('errorcontainer').classList.remove('error');
}
const urltext = document.getElementById('input-url');
window.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const url = urlParams.get('url')
    const hash = window.location.hash;
    if (hash) {
        urltext.value = hash.substring(1);
        openInSudokupad(false);
    }
    else if (url) {
        urltext.value = decodeURIComponent(url);
        textOnChange();
    }
    urltext.focus();

    let settings = PenpaDecoder.settings;
    let fieldset = document.querySelector('fieldset');
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

    const test = urlParams.get('test');
    if (test !== null) {
        fieldset.style.display = 'block';
    }

    PenpaDecoder.ParseUrlSettings();
    let options = document.querySelectorAll('fieldset input[type=checkbox]');
    for(let option of options) {
        option.checked = PenpaDecoder.flags[option.name] ? true : false;
    }

    //
    // DRAG-N-DROP
    //

    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_events
    let dropArea = document.querySelector('.penpa');
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
                handleLoadFile(dt.files[0]);
                break;
            }
            else if (type.startsWith('text/')) {
                urltext.value = dt.getData(type);
                textOnChange();
                document.getElementById('generated-url').value = '';
                break;
            }
        }
    }

});

let lastActionSelection = 'open'; // default action

const reUrl = /^(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const reJSON = /^[\s'"]*\{/;
function handleLoadFile(file) {
    if (file.size > 60000) {
        setError(`File '${file.name}' is too large`);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        let result = event.target.result;
        if (result.match(reUrl) || result.match(reJSON)) {
            urltext.value = result;
            textOnChange();
            document.getElementById('generated-url').value = '';
        }
        else {
            setError(`File '${file.name}' does not contain JSON or URL`);
        }
    };
    reader.readAsText(file);
}

function textOnChange() {
    clearError();
    let inputUrlElem = document.getElementById('input-url');
    let buttonElem = document.querySelector('.textarea-container button');
    let urlstring = inputUrlElem.value.trim();
    buttonElem.classList.toggle('hidden', urlstring.length === 0);
}
function clearInputUrl() {
    let inputUrlElem = document.getElementById('input-url');
    inputUrlElem.value = '';
    textOnChange();
    inputUrlElem.focus();
}

function OnSelectActionChange(value) {
    showUrl = value.startsWith('create');
    let section = document.getElementById('generated-url-section');
    section.classList.toggle('visible', showUrl);
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
    let selectElem = document.getElementById('select-destination');
    let option = document.createElement('option');
    option.value = urlPrefix;
    option.innerHTML = urlPrefix.match(/(?:https?:\/\/)?([^\/]+)/)[1]
    selectElem.appendChild(option);
}
destinations.forEach(url => addDestination(url));

let selectElem = document.getElementById('select-destination');
let destination = localStorage.destination;
selectElem.value = destination;
if (selectElem.value !== destination) {
    selectElem.selectedIndex = 0;
}

// Stub to capture messages
const Swal = {
    fire: function(opts) {
        setError(opts.html);
    }
}

const reFPuzPrefix = /^(fpuz(?:zles)?)(.*)/;
const stripFPuzPrefix = fpuzzle => fpuzzle.replace(reFPuzPrefix, '$2');

function openInSudokupad(openinNewWindow = true)
{
    let selectElem = document.getElementById('select-destination');
    let destination = selectElem.value;
    localStorage.destination = destination;

    let urltext = document.getElementById('input-url')
    let urlstring = urltext.value.trim();

    let param = urlstring.substring(urlstring.indexOf('&') + 1);
    if (param.length === 0)
        return;

    let button = document.getElementById('btnconvert');
    button.disabled = true;
    button.innerHTML = "Converting...";

    Promise.resolve(urlstring)
    .then(url => puzzleLinkConverter.expandShortUrl(url))
    .then(url => puzzleLinkConverter.convertPuzzleUrl(url))
    .then(async puzzleid => {
        if (!puzzleid) {
            throw {customMessage: 'Not a recognized puzzle URL'}
        } 
        if (destination.includes('?')) {
            puzzleid = puzzleid.replace('?', '&');
        }
        let redirect = destination + puzzleid;
        console.log(redirect, redirect.length);

        if (!openinNewWindow) {
            window.open(redirect, '_self');
        }
        else {
            let generatedUrlElem = document.getElementById('generated-url');
            let actionElem = document.getElementById('select-action');
            switch(actionElem.value)
            {
                case 'create-url': {
                    generatedUrlElem.value = redirect;
                    generatedUrlElem.select();
                    generatedUrlElem.focus();
                    var btncopyurl = document.getElementById('btncopyurl');
                    btncopyurl.disabled = !redirect;				
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
                    var btncopyurl = document.getElementById('btncopyurl');
                    btncopyurl.disabled = !newUrl;								
                } break;								

                case 'convert-tojson': {
                    const {stringify} = JsonStringifyPrettyCompact;
                    const stringifyPretty = (obj) => stringify(obj, {maxLength: 150});
                    generatedUrlElem.value = '';
                    const {isRemotePuzzleId, parsePuzzleData, fetchPuzzle} = PuzzleLoader;
                    let raw = puzzleid;
                    puzzleid = puzzleid.split('&')[0];

                    if(isRemotePuzzleId(puzzleid)) {
                        puzzleid = await fetchPuzzle(puzzleid);
                        if(isRemotePuzzleId(puzzleid)) {
                            setError('Not a recognized JSON puzzle format');
                            return;
                        }
                    }
                    if (reFPuzPrefix.test(puzzleid)) {
                        let fpuzzle = loadFPuzzle.saveDecodeURIComponent(stripFPuzPrefix(puzzleid));
                        if(typeof fpuzzle === 'string') {
                            try {
                                fpuzzle = JSON.parse(loadFPuzzle.decompressPuzzle(fpuzzle));
                                urltext.value = stringifyPretty(fpuzzle);
                            }
                            catch {
                                setError('Not a recognized JSON puzzle format');
                                return;
                            }
                        }
                    }
                    else {
                        let puzzle = parsePuzzleData(puzzleid);						
                        urltext.value = stringifyPretty(puzzle);
                    }

                    document.getElementById('generated-url').value = '';
                    if (lastActionSelection) {
                        actionElem.value = lastActionSelection;
                        OnSelectActionChange(lastActionSelection);
                    }
                } break;								

                default: {
                    window.open(redirect, '_blank');
                    return;
                }
            }
        }
    })
    .catch(err => {
        console.error('Unable to convert Penpa puzzle link');
        console.log(err);
        setError(err.customMessage || 'An error occured while processing the URL.<br>');
    })
    .then(()=> {
        button.disabled = false;
        button.innerHTML = "Convert URL";
    });
}

function btnLoadFromFile() {
    console.log('load from file!');
    loadFromFile(handleLoadFile, {accept: '.json, .txt'});
}

function copyUrl() {
    let textarea = document.getElementById('generated-url');
    navigator.clipboard.writeText(textarea.value);
    let element = document.getElementById('urlIsCopied');
    // Retrigger animation
    element.classList.remove("animation");
    void element.offsetWidth; // trigger a DOM reflow
    element.classList.add("animation");
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