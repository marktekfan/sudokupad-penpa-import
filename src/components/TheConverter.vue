<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TheAppFooter from '@/components/TheAppFooter.vue';
import TextareaSyntax from '@/components/TextareaSyntax.vue';
import SvgSpinners90RingWithBg from '@/components/SvgSpinners90RingWithBg.vue';
import { useAppState, type AppAction } from '@/stores/appState';
import { useClipboard, unrefElement } from '@vueuse/core';
import { ConverterFlags, type FlagName } from '@/converter-flags';
import { usePuzzleConverter } from '@/composables/usePuzzleConverter';
import { useToast } from 'primevue/usetoast';
import { useUniqueToast } from '@/composables/useUniqueToast';
import { onMounted, ref, watch, type Ref } from 'vue';
import MetadataEditor from './MetadataEditor.vue';
import type { Metadata } from '@/edit-metadata';
import { updateMetadata } from '@/edit-metadata';
import stringifyPretty from 'json-stringify-pretty-compact';

const appState = useAppState();
const { converterTargets } = appState;
const { selectedAction, selectedTarget, selectedFlags, converting, inputUrl, outputUrl, metadata } = storeToRefs(appState);
const prettyFormat = (obj: unknown) => stringifyPretty(obj, { maxLength: 150 });

function onUpdateMetadata(newMetadata: Ref<Metadata>) {
	appState.inputUrl = prettyFormat(updateMetadata(newMetadata.value));
}

onMounted(async () => {
	let uri = window.location.search.substring(1);
	let hash = window.location.hash.substring(1);
	let urlParams = new URLSearchParams(uri);
	let url = urlParams.get('url') && window.location.href.split('url=', 2)[1];
	if (url) {
		appState.inputUrl = url;
	} else if (hash && hash.length > 25) {
		appState.inputUrl = hash;
		await convertPuzzle(true);
	}

	let port = urlParams.get('port');
	let testMode = urlParams.get('test');
	if (testMode != null) {
		appState.testMode = true;
		port = port || testMode;
		appState.inputUrl = localStorage.getItem('testurl') ?? '';
	}
	if (port != null) {
		let portNr = Number(port) > 0 ? Number(port) : 5501;
		appState.addConverterTarget(`http://127.0.0.1:${portNr}/sudoku.html?puzzleid=`);
	}
	if (testMode === null) {
		return;
	}
});

interface AppActionItem {
	name: string;
	value: AppAction;
	disabled?: boolean;
}

const converterActions: AppActionItem[] = [
	{ name: 'Open in new tab', value: 'open' },
	{ name: 'Create URL', value: 'create-url' },
	/*
	{ name: "Create short TinyPuz.com", value: "create-tinyurl" },
	*/
	{ name: '──────────', value: '-', disabled: true },
	{ name: 'Convert to JSON', value: 'convert-tojson' },
	{ name: 'Edit Metadata', value: 'edit-metadata' },
];

selectedAction.value = converterActions[0].value;
selectedTarget.value = converterTargets[0].value;

const flagDescriptions = ConverterFlags.FlagDescriptions();
const converterFlags = new ConverterFlags();

const btnConvert = ref<HTMLButtonElement>(null!);
// const inputTextArea = ref<HTMLTextAreaElement>(null!);
const outputTextArea = ref<HTMLTextAreaElement>(null!);
watch(outputUrl, () => {
	//console.log(unrefElement(output.value));
	if (appState.outputUrl) {
		unrefElement(outputTextArea)?.focus();
	}
});

InitConverterOptions();

function InitConverterOptions() {
	converterFlags.obtain();
	const flagValues = converterFlags.getFlagValues();
	selectedFlags.value = (Object.keys(flagValues) as FlagName[]).filter(key => flagValues[key]);
}

const toast = useUniqueToast(useToast());
const puzzleConverter = usePuzzleConverter();

async function convertPuzzle(redirect = false) {
	try {
		converting.value = true;
		await puzzleConverter.ConvertPuzzle(redirect);
	} catch (err: unknown) {
		if (err instanceof Error) {
			if (err.message.includes('JSON')) {
				toast.add({ severity: 'error', summary: 'JSON Syntax Error', detail: err.message, life: 6000 });
			} else {
				toast.add({ severity: 'error', summary: 'Something went wrong', detail: err.message, life: 6000 });
			}
		} else {
			const error = err as object;
			toast.add({ severity: 'error', summary: 'Unrecognized error', detail: error, life: 6000 });
		}
	} finally {
		converting.value = false;
	}
}

async function CopyUrlToClipboard() {
	// toast.add({ severity: 'success', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	// toast.add({ severity: 'contrast', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	// toast.add({ severity: 'secondary', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	// toast.add({ severity: 'error', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	// toast.add({ severity: 'warn', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	const clipboard = useClipboard({ legacy: true });
	await clipboard.copy(appState.outputUrl);
	toast.add({ severity: 'info', summary: 'Generated URL copied to clipboard', life: 5000 });
}

// Set focus to 'Convert' button when new content is pasted.
// This allows the user to immediately press the 'enter' key to convert.
function PasteNew(_: any) {
	window.setTimeout(function () {
		unrefElement(btnConvert)?.focus();
	}, 1);
}
</script>

<!-- ====================================================================== -->

<template>
	<div id="appmain" class="flex flex-column gap-2 m-3 text-lg">
		<div class="flex flex-column relative">
			<span> <b>Penpa+</b>, <b>f-puzzles</b>, <b>SudokuPad</b> or <b>tinyurl.com</b> URL or JSON </span>
			<TextareaSyntax v-model="inputUrl" @paste-new="PasteNew"></TextareaSyntax>
		</div>
		<div class="flex justify-content-start flex-wrap align-items-center">
			<label class="mr-2">Open in</label>
			<Select
				v-model="selectedTarget"
				:options="converterTargets"
				optionLabel="name"
				optionValue="value"
				option-disabled="disabled"
				checkmark
				placeholder="Select destination"
			/>

			<label class="ml-3 mr-2">Action</label>
			<Select
				v-model="selectedAction"
				:options="converterActions"
				optionLabel="name"
				optionValue="value"
				option-disabled="disabled"
				checkmark
				placeholder="Select an Action"
			/>
			<Button ref="btnConvert" class="ml-3" :loading="converting" @click="() => convertPuzzle()" :disabled="!inputUrl">
				<div v-if="converting" class="flex align-items-center mx-0">
					Converting... &nbsp;
					<SvgSpinners90RingWithBg class="pi-spin" />
				</div>
				<div v-else class="flex align-items-center">Convert Puzzle</div>
			</Button>
		</div>

		<div v-show="selectedAction == 'create-url' || outputUrl" class="flex flex-column gap-1">
			<span> Generated URL </span>
			<Textarea
				ref="outputTextArea"
				class="text-sm p-1 shadow-2"
				spellcheck="false"
				readonly
				v-model="outputUrl"
				rows="4"
				cols="120"
				placeholder=""
			></Textarea>
			<div class="flex h-4rem">
				<div>
					<Button
						icon-pos="right"
						icon="pi pi-copy"
						label="Copy URL to clipboard"
						@click="CopyUrlToClipboard"
						:disabled="!outputUrl"
						class="my-2"
					></Button>
				</div>
			</div>
		</div>

		<MetadataEditor v-model="metadata" @update="onUpdateMetadata" />

		<div v-if="appState.settingsVisible || appState.testMode">
			<Fieldset legend="Converter Options" class="shadow-2">
				<div class="card flex justify-content-start">
					<div class="flex flex-column gap-1">
						<div v-for="category of flagDescriptions.filter(flag => !flag.hidden)" :key="category.key" class="flex align-items-center">
							<Checkbox v-model="selectedFlags" :inputId="category.key" name="category" :value="category.key" class="h-3" />
							<label :for="category.key" class="pl-2">{{ category.title }}</label>
						</div>
					</div>
				</div>
			</Fieldset>
		</div>
		<div v-else class="my-5"></div>

		<TheAppFooter />
	</div>
</template>

<!-- ====================================================================== -->

<style scoped>
#appmain {
	max-width: min(55rem, 100%);
}

.p-checkbox {
	scale: 0.8; /* Make checkbox smaller */
}
</style>
