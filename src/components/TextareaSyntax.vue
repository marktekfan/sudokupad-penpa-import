<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppState } from '@/stores/appState';
import { computed, onMounted, ref, watch } from 'vue';
import { unrefElement } from '@vueuse/core';
import Prism from 'prismjs';
//import '@/prism/theme/prism-coy.css';
//import '@/prism/theme/prism-okaidia.css';
import '@/prism/plugins/line-highlight/prism-line-highlight';
import '@/prism/plugins/line-highlight/prism-line-highlight.css';

const emit = defineEmits(['pasteNew']);
const model = defineModel({ default: '' });

const appState = useAppState();
const { inputUrl } = storeToRefs(appState);

const errorMessage = ref('');
const isJson = computed(() => {
	const is = /^\s*\{|}\s*$/.test(inputUrl.value);
	// console.log('computed.isJson:', is);
	return is;
});

const isUrl = computed(() => false); //!isJson.value);

const inputTextArea = ref<HTMLTextAreaElement>(null!);

function ClearInput() {
	// Try to clear and preserve undo buffer
	document.execCommand('selectAll', false);
	document.execCommand('delete', false);

	// When above commands failed then fallback to old behaviour, which also clears the undo buffer
	if (appState.inputUrl !== '') {
		appState.inputUrl = '';
	}
	unrefElement(inputTextArea)?.focus();
}

onMounted(() => {
	addEventListener("load", () => {
		// Restore syntax hilighting/
		// Update reactive inputUrl with pre-filled browser data.
		// E.g. after page duplication or reactivation from sleep.
		const inputTextArea = document.querySelector('textarea#editing') as HTMLTextAreaElement;
		//console.warn('load:textarea.value', inputTextArea?.value ?? '');
		inputUrl.value = inputTextArea?.value ?? '';
		// Todo: Any other fields to update here?
	});
	
	// Attach resizer
	const resizeObserver = new ResizeObserver(entries => {
		for (const entry of entries) {
			const hi = document.querySelector('#highlighting')! as HTMLElement;
			const bbs = entry.borderBoxSize[0];
			hi.style.height = bbs.blockSize + 'px';
		}
	});
	resizeObserver.observe(document.querySelector('#editing')!);

	watch(
		inputUrl,
		() => {
			update(inputUrl.value);
			sync_scroll();
		},
		{ immediate: true }
	);

	watch(isJson, newValue => {
		// Toggle json syntax editor
		const highlighting = document.querySelector('#highlighting') as HTMLElement;
		const highlightingContent = document.querySelector('#highlighting-content') as HTMLElement;
		highlighting.classList.toggle('language-none', !newValue);
		highlighting.classList.toggle('language-json', newValue);
		highlightingContent.classList.toggle('language-none', !newValue);
		highlightingContent.classList.toggle('language-json', newValue);

		const textarea = document.querySelector('#editing') as HTMLTextAreaElement;
		textarea.style['minHeight'] = isJson.value ? '30rem' : '5rem';

		// clear syntax editor related UI
		if (!newValue) {
			let result_element = document.querySelector('#highlighting-content');
			if (result_element) {
				errorMessage.value = '';
				result_element.innerHTML = '';
				Prism.highlightElement(result_element);
			}
		}
	});
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
	//console.log('update(text):', text);

	let result_element = document.querySelector('#highlighting-content');
	if (!result_element) return;

	if (!isJson.value) return;

	// Handle final newlines (see article)
	if (text[text.length - 1] == '\n') {
		text += ' ';
	}
	// Update code
	result_element.innerHTML = text.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('<', 'g'), '&lt;'); /* Global RegExp */
	let highlighting_element = document.querySelector('#highlighting') as HTMLTextAreaElement;
	try {
		errorMessage.value = '';
		JSON.parse(text);
		highlighting_element.removeAttribute('data-line');
	} catch (ex: any) {
		if (ex.name == 'SyntaxError') {
			//console.log(ex);
			const message = ex.message;
			errorMessage.value = message;
			const match = message.match(/at position (?<position>\d+) \(line (?<line>\d+) column (?<column>\d+)/);
			if (match) {
				// console.log(match);
				const line = match.groups.line;
				highlighting_element.setAttribute('data-line', line);
			} else {
				highlighting_element.removeAttribute('data-line');
			}
		}
	}

	Prism.highlightElement(result_element);
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

Prism.languages.json = {
	property: {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
		lookbehind: true,
		greedy: true,
	},
	string: {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		lookbehind: true,
		greedy: true,
	},
	comment: {
		pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: true,
	},
	number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	punctuation: /[{}[\],]/,
	operator: /:/,
	boolean: /\b(?:false|true)\b/,
	null: {
		pattern: /\bnull\b/,
		alias: 'keyword',
	},
};
Prism.languages.uri = {
	scheme: {
		pattern: /^[a-z][a-z0-9+.-]*:/im,
		greedy: true,
		inside: {
			'scheme-delimiter': /:$/,
		},
	},
	fragment: {
		pattern: /#[\w\-.~!$&'()*+,;=%:@/?]*/,
		inside: {
			'fragment-delimiter': /^#/,
		},
	},
	query: {
		pattern: /\?[\w\-.~!$&'()*+,;=%:@/?]*/,
		inside: {
			'query-delimiter': {
				pattern: /^\?/,
				greedy: true,
			},
			'pair-delimiter': /[&;]/,
			pair: {
				pattern: /^[^=][\s\S]*/,
				inside: {
					key: /^[^=]+/,
					value: {
						pattern: /(^=)[\s\S]+/,
						lookbehind: true,
					},
				},
			},
		},
	},
	authority: {
		pattern: RegExp(
			/^\/\//.source +
				// [ userinfo "@" ]
				/(?:[\w\-.~!$&'()*+,;=%:]*@)?/.source +
				// host
				('(?:' +
					// IP-literal
					/\[(?:[0-9a-fA-F:.]{2,48}|v[0-9a-fA-F]+\.[\w\-.~!$&'()*+,;=]+)\]/.source +
					'|' +
					// IPv4address or registered name
					/[\w\-.~!$&'()*+,;=%]*/.source +
					')') +
				// [ ":" port ]
				/(?::\d*)?/.source,
			'm'
		),
		inside: {
			'authority-delimiter': /^\/\//,
			'user-info-segment': {
				pattern: /^[\w\-.~!$&'()*+,;=%:]*@/,
				inside: {
					'user-info-delimiter': /@$/,
					'user-info': /^[\w\-.~!$&'()*+,;=%:]+/,
				},
			},
			'port-segment': {
				pattern: /:\d*$/,
				inside: {
					'port-delimiter': /^:/,
					port: /^\d+/,
				},
			},
			host: {
				pattern: /[\s\S]+/,
				inside: {
					'ip-literal': {
						pattern: /^\[[\s\S]+\]$/,
						inside: {
							'ip-literal-delimiter': /^\[|\]$/,
							'ipv-future': /^v[\s\S]+/,
							'ipv6-address': /^[\s\S]+/,
						},
					},
					'ipv4-address': /^(?:(?:[03-9]\d?|[12]\d{0,2})\.){3}(?:[03-9]\d?|[12]\d{0,2})$/,
				},
			},
		},
	},
	path: {
		pattern: /^[\w\-.~!$&'()*+,;=%:@/]+/m,
		inside: {
			'path-separator': /\//,
		},
	},
};
Prism.languages.url = Prism.languages.uri;
</script>

<!-- ====================================================================== -->

<template>
	<div class="relative">
		<Button outlined id="clearbutton" icon="pi pi-times" class="p-1 w-0" v-show="inputUrl" @click="ClearInput"></Button>
		<div>
			<div v-if="errorMessage" inert class="error-message">
				<span>{{ errorMessage }}</span>
			</div>
			<Textarea
				class="shadow-2"
				:class="{ 'language-json': isJson, 'language-url': isUrl }"
				id="editing"
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
			<pre id="highlighting" inert>
				<code id="highlighting-content"></code>
			</pre>
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
	translate: -4rem;
	z-index: 2;
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

#editing[class*='language-'] + #highlighting {
	visibility: visible;
}

/* Make textarea almost completely transparent */

#editing[class*='language-'] {
	color: #0001;
	background: transparent;
	caret-color: black; /* Or choose your favourite color */
}

.my-app-dark #editing[class*='language-'] {
	color: #fff1;
	caret-color: white; /* Or choose your favourite color */
}

/* Can be scrolled */
#editing[class*='language-'],
#highlighting {
	white-space: nowrap; /*ML TEMP*/ /* Allows textarea to scroll horizontally */
}

/* No resize on textarea */
/* #editing {
	resize: none;
} */
</style>
