"use strict";
window.addEventListener('DOMContentLoaded', () => {
    let urltext = document.querySelector('#penpa-url')
    urltext.focus();
});

const Swal = {
    fire: function(opts) {
        let errortext = document.querySelector('#errortext');
        errortext.innerHTML = opts.html;
        // Framework.showDialog({
        // 	parts: [
        // 		{tag: 'title', innerHTML: opts.title, style: 'text-align: center'},
        // 		{tag: 'label', innerHTML: opts.html},
        // 		{tag: 'options', options: [opts.confirmButtonText], style: 'flex-direction: row; justify-content: center;'},
        // 	],
        // 	onButton: this.handleDialogButton,
        // 	//centerOverBoard: true
        // });
    }
}

function onChangeText(event) {
    let errortext = document.querySelector('#errortext');
    errortext.innerHTML = '';
}

function openInSudokupad(event)
{
    let urltext = document.querySelector('#penpa-url')
    let urlstring = urltext.value.trim();

    let param = urlstring.substring(urlstring.indexOf('&') + 1);
    if (param.length === 0)
        return;

    Promise.resolve(urlstring)
    .then(penpa => loadPenpaPuzzle(penpa))
    .then(res => res && loadFPuzzle.compressPuzzle(res))
    .then(ctc => {
        if (!ctc) return;		
        var redirect = 'https://beta.sudokupad.app/ctc' + ctc;
        console.log(redirect, redirect.length);
        window.open(redirect, '_blank');
    })
    .catch(err => {
        console.error('Unable to convert penpa puzzle');
        console.log(err);
        let errortext = document.querySelector('#errortext');
        if (err.penpa) {
            errortext.innerHTML = err.penpa;
        }
        else {
            errortext.innerHTML = 'An error occured while processing the penpa url.<br>'
        }
    });
}