<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TheAppBar from '@/components/TheAppBar.vue';
import SvgSpinners90RingWithBg from '@/components/SvgSpinners90RingWithBg.vue';
import { useAppState } from '@/stores/appState';
import { useClipboard } from '@vueuse/core';
import { ConverterFlags, type FlagName } from '@/converter-flags';
import { usePuzzleConverter } from '@/usePuzzleConverter';
import { useToast } from 'primevue/usetoast';

const appState = useAppState();
const { converterTargets } = appState;
const { selectedAction, selectedTarget, selectedFlags, converting, inputUrl, outputUrl } = storeToRefs(appState);

const converterActions = [
	{ name: 'Open in new tab', value: 'open' },
	{ name: 'Create URL', value: 'create-url' },
	/*
	{ name: "Create short TinyPuz.com", value: "create-tinyurl" },
	*/
	{ name: '──────────', value: '-', disabled: true },
	{ name: 'Convert to JSON', value: 'convert-tojson' },
];
selectedAction.value = converterActions[0].value;
selectedTarget.value = converterTargets[0].value;

const flagDescriptions = ConverterFlags.FlagDescriptions();
const converterFlags = new ConverterFlags();

InitConverterOptions();

function InitConverterOptions() {
	const flagValues = converterFlags.getFlagValues();
	selectedFlags.value = (Object.keys(flagValues) as FlagName[]).filter(key => flagValues[key]);
}

function convertPuzzle() {
	//addConverterTarget('test', 'localhost');
	try {
		converting.value = true;
		console.log(JSON.stringify(selectedFlags.value));
		const puzzleConverter = usePuzzleConverter();
		puzzleConverter.ConvertPuzzle();
	} finally {
		setTimeout(() => (converting.value = false), 500);
	}
}

appState.outputUrl='TODO'

const toast = useToast();
async function CopyUrlToClipboard() {
	toast.add({ severity: 'info', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	toast.add({ severity: 'success', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	toast.add({ severity: 'contrast', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	toast.add({ severity: 'secondary', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	toast.add({ severity: 'error', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	toast.add({ severity: 'warn', summary: 'Generated URL copied to clipboard', xlife: 3000 });
	const clipboard = useClipboard();
	await clipboard.copy(appState.outputUrl);
}
</script>

<!-- ====================================================================== -->

<template>
	<TheAppBar />
	<div id="appmain" class="flex flex-column gap-2 m-3 text-lg">
		<div class="flex flex-column relative">
			<span> <b>Penpa+</b>, <b>f-puzzles</b>, <b>SudokuPad</b> or <b>tinyurl.com</b> URL or JSON </span>
			<div class="relative">
				<Button outlined id="clearbutton" icon="pi pi-times" class="p-1 w-0" v-show="inputUrl" @click="inputUrl = ''"></Button>
				<Textarea class="text-sm p-1 mt-1 shadow-2" spellcheck="false" v-model="inputUrl" rows="10" cols="120" placeholder="https://"> </Textarea>
			</div>
		</div>
		<div class="flex justify-content-start flex-wrap align-items-center">
			<label class="mr-2">Open in</label>
			<Dropdown
				v-model="selectedTarget"
				:options="converterTargets"
				optionLabel="name"
				optionValue="value"
				option-disabled="disabled"
				checkmark
				placeholder="Select destination"
			/>

			<label class="ml-3 mr-2">Action</label>
			<Dropdown
				v-model="selectedAction"
				:options="converterActions"
				optionLabel="name"
				optionValue="value"
				option-disabled="disabled"
				checkmark
				placeholder="Select an Action"
			/>
			<Button class="ml-3" :loading="converting" @click="convertPuzzle" :disabled="!inputUrl">
				<div v-if="converting" class="flex align-items-center mx-0">
					Converting... &nbsp;
					<SvgSpinners90RingWithBg class="pi-spin" />
				</div>
				<div v-else class="flex align-items-center">Convert Puzzle</div>
			</Button>
		</div>

		<div class="min-h-1rem">
			<div v-if="!converting"></div>
			<Message v-else severity="error" @close="">Error Message</Message>
		</div>

		<div v-if="selectedAction == 'create-url' || true" class="flex flex-column gap-1">
			<span> Generated URL </span>
			<Textarea class="text-sm p-1 shadow-2" spellcheck="false" readonly v-model="outputUrl" rows="4" cols="120" placeholder=""></Textarea>
			<div class="flex h-4rem">
				<Toast position="top-right" :pt="{ container: { class: 'shadow-6 xborder-left-3' } }" />
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

		<div>
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
	</div>
</template>

<!-- ====================================================================== -->

<style scoped>
#appmain {
	/* background-color: red; */
	max-width: min(55rem, 100%);
}

textarea {
	resize: vertical;
	width: min(55rem, 100%);
}

#clearbutton {
	position: absolute;
	top: 0.5rem;
	left: min(55rem, 100%);
	translate: -3rem;
}

.p-checkbox {
	scale: 0.8; /* Make checkbox smaller */
}
</style>

<style>
html {
	font-size: 1rem;
	/* font-size: 1.125rem; */
}
body {
	margin: 0;
	width: 100%;
	max-width: 100%;
	height: 100%;
}
html,
body,
textarea {
	xfont-family: Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

/*
.p-component,
.p-inputtext {
  font-size: inherit;
}
.p-dropdown-item {
  font-size: 1.125rem;
}
*/
</style>
