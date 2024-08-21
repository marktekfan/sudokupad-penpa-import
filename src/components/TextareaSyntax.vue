<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppState } from '@/stores/appState';
import { computed, onMounted, ref, watch } from 'vue';
import { unrefElement } from '@vueuse/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-uri';
import 'prismjs/components/prism-json';

import '@/prismjs/plugins/line-highlight/prism-line-highlight';
import '@/prismjs/plugins/line-highlight/prism-line-highlight.css';
import { text } from 'stream/consumers';

//import '@/prismjs/themes/prism-coy.css';
//import '@/prismjs/themes/prism-okaidia.css';

const emit = defineEmits(['pasteNew']);
const model = defineModel({ default: '' });

const appState = useAppState();
const { inputUrl } = storeToRefs(appState);

const errorMessage = ref('');
const wraptext = ref(true);

const inputType = computed(() => {
	return /^\s*\{|}\s*$/.test(inputUrl.value) ? 'json' : true ? 'url' : 'none';
});

const inputTextArea = ref<HTMLTextAreaElement>(null!);

function ClearInput() {
	appState.inputUrl = '';
	unrefElement(inputTextArea)?.focus();
}

onMounted(() => {
	// Attach resizer
	const resizeObserver = new ResizeObserver(entries => {
		for (const entry of entries) {
			const hi = document.querySelector('#highlighting')! as HTMLElement;
			const bbs = entry.borderBoxSize[0];
			hi.style.height = bbs.blockSize + 'px';
		}
		sync_scroll();
	});
	resizeObserver.observe(document.querySelector('#editing')!);

	// Set primary focus
	const textarea = document.querySelector('#editing') as HTMLTextAreaElement;
	textarea.focus();

	watch(
		inputUrl,
		() => {
			update(inputUrl.value);
			sync_scroll();
		},
		{ immediate: true }
	);

	watch(
		inputType,
		newInputType => {
			// Toggle json syntax editor
			const pre = document.querySelector('#highlighting') as HTMLElement;
			const code = document.querySelector('#highlighting-content') as HTMLElement;
			pre.classList.toggle('language-none', newInputType === 'none');
			code.classList.toggle('language-none', newInputType === 'none');

			pre.classList.toggle('language-json', newInputType === 'json');
			code.classList.toggle('language-json', newInputType === 'json');

			pre.classList.toggle('language-url', newInputType === 'url');
			code.classList.toggle('language-url', newInputType === 'url');

			wraptext.value = newInputType !== 'json';

			const textarea = document.querySelector('#editing') as HTMLTextAreaElement;
			textarea.style['minHeight'] = newInputType == 'json' ? '30rem' : '5rem';

			// clear syntax editor related UI
			if (newInputType !== 'json') {
				errorMessage.value = '';
			}
			if (newInputType === 'none') {
				code.innerHTML = '';
			}

			Prism.highlightElement(code);
		},
		{ immediate: true }
	);
});

function PasteDetected(e: any) {
	// Detect paste event which replaces all content.
	// This can be used for setting focus to 'Convert' button when new content is pasted.
	// This allows the user to immediately press the 'enter' key to convert.
	const textarea = e.target as HTMLTextAreaElement;
	if (textarea.selectionStart == 0 && textarea.selectionEnd == textarea.value.length) {
		emit('pasteNew');
	}
}

// Based on this article:
// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/

function update(text: string) {
	// console.log('update(text: string)');

	let code = document.querySelector('#highlighting-content');
	if (!code) return;

	//if (!isJson.value && !isUrl.value) return;

	// Handle final newlines (see article)
	if (text[text.length - 1] == '\n') {
		text += ' ';
	}
	// Update code
	code.innerHTML = text.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('<', 'g'), '&lt;'); /* Global RegExp */
	let pre = document.querySelector('#highlighting') as HTMLTextAreaElement;
	try {
		errorMessage.value = '';
		pre.removeAttribute('data-line');
		if (inputType.value === 'json') {
			JSON.parse(text);
		}
	} catch (ex: any) {
		if (ex.name == 'SyntaxError') {
			//console.log(ex);
			const message = ex.message;
			errorMessage.value = message;
			// Get line number from error message
			const match = message.match(/at position (?<position>\d+) \(line (?<line>\d+) column (?<column>\d+)/);
			if (match) {
				// console.log(match);
				const line = match.groups.line;
				pre.setAttribute('data-line', line);
			} else {
				pre.removeAttribute('data-line');
			}
		}
	}

	Prism.highlightElement(code);
}

function sync_scroll(_?: Event) {
	//const element = e.target as HTMLTextAreaElement;
	const element = document.querySelector('#editing') as HTMLTextAreaElement;
	/* Scroll result to scroll coords of event - sync with textarea */
	const result_element = document.querySelector('#highlighting') as HTMLTextAreaElement;
	// Get and set x and y
	result_element.scrollTop = element.scrollTop;
	result_element.scrollLeft = element.scrollLeft;
}

function check_tab(event: KeyboardEvent) {
	const element = event.target as HTMLTextAreaElement;
	//console.log(event);
	if (event.key == 'Tab') {
		/* Tab key pressed */
		event.preventDefault(); // stop normal

		// document.execCommand is depreciated. But the alternative below does not record undo.
		document.execCommand('insertText', false, '\t');
		//let code = element.value;
		// let before_tab = code.slice(0, element.selectionStart); // text before tab
		// let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
		// let cursor_pos = element.selectionStart + 1; // where cursor moves after tab - moving forward by 1 char to after tab
		// element.value = before_tab + "\t" + after_tab; // add tab char
		// // move cursor
		// element.selectionStart = cursor_pos;
		// element.selectionEnd = cursor_pos;
		update(element.value); // Update text to include indent
	}
}
</script>

<!-- ====================================================================== -->

<template>
	<div class="relative">
		<Button outlined id="clearbutton" icon="pi pi-times" title="Clear input" v-show="inputUrl" @click="ClearInput"></Button>
		<div id="textsyntax" :class="{ wraptext: wraptext }">
			<div v-if="errorMessage" inert class="error-message">
				<span>{{ errorMessage }}</span>
			</div>
			<Textarea
				id="editing"
				class="shadow-2"
				ref="inputTextArea"
				spellcheck="false"
				v-model="model"
				rows="10"
				cols="120"
				placeholder="https://"
				@scroll="sync_scroll"
				@keydown="check_tab"
				@paste="PasteDetected"
			>
			</Textarea>
			<!-- :class="{ 'language-json': inputUrl === 'json', 'language-url': inputUrl === 'url' }" -->

			<pre id="highlighting" inert><code id="highlighting-content"></code></pre>
		</div>
	</div>
</template>

<!-- ====================================================================== -->

<style scoped>
textarea {
	resize: vertical;
	width: min(55rem, 100%);
	min-height: 3rem;
	word-break: break-all;
}

#clearbutton {
	position: absolute;
	top: 0.5rem;
	left: min(55rem, 100%);
	translate: -3rem;
	z-index: 2;
	background-color:#fff2;
	padding: .25rem;
}
#clearbutton:hover {
	background-color:#fff6;
}
.error-message {
	position: absolute;
	top: 0;
	left: 0rem;
	font-size: 1rem;
	width: min(55rem, 100%);
	z-index: 2;
}
.error-message > span {
	margin-right: 3.5rem;
	background-color: #ffdddd;
	border: 2px solid red;
	padding: 1px 5px;
	float: right;
}
.my-app-dark .error-message > span {
	background-color: #600000;
}

/* Please see the article */
#editing,
#highlighting {
	/* Both elements need the same text and space styling so they are directly on top of each other */
	margin-top: 0.25rem;
	padding: 10px;
	width: min(55rem, 100%);
	height: 150px;
}
#editing,
#highlighting,
#highlighting * {
	/* Also add text styles to highlighing tokens */
	font-size: 0.9rem;
	font-family: monospace;
	line-height: 1.5;
	tab-size: 2;
}

/* #highlighting, */
#editing {
	/* In the same place */
	position: absolute; /*ML TEMP*/
	top: 0;
	left: 0;
}

/* Move the textarea in front of the result */

#editing {
	z-index: 1;
}
#highlighting {
	z-index: 0;
	visibility: hidden;
	/* background-color: red; */
}

#highlighting[class*='language-'] {
	visibility: visible;
}

/* Make textarea almost completely transparent */

#editing {
	color: #0001;
	background: transparent;
	caret-color: black; /* Or choose your favourite color */
}

.my-app-dark #editing {
	color: #fff1;
	caret-color: white; /* Or choose your favourite color */
}

/* Can be scrolled */
#editing {
	white-space: nowrap; /* Allows textarea to scroll horizontally */
}

.wraptext #editing,
.wraptext #highlighting {
	white-space: pre-wrap; /* Disallows textarea to scroll horizontally */
}
.wraptext pre {
	white-space: pre-wrap;
	word-wrap: break-word;
	word-break: break-all;
}
.wraptext pre[class*="language-"] > code {
	background-image: inherit;
}

pre {
	border: 1px solid transparent; /* same border as textarea */
}

/* No resize on textarea */
/* #editing {
	resize: none;
} */
</style>
