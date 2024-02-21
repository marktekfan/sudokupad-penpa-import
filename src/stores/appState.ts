import { defineStore } from 'pinia';
// import { nextTick } from 'vue';
import { ref } from 'vue';

export const useAppState = defineStore('AppState', () => {
	const settingsVisible = ref(false);
	const errorMessage = ref('');
	const inputUrl = ref('');
	const outputUrl = ref('');
	const converting = ref(false);
	const selectedTarget = ref('');
	const selectedAction = ref('');
	const selectedFlags = ref<string[]>([]);

	const converterTargets = [
		{ name: 'sudokupad.app', value: 'https://sudokupad.app/' },
		{ name: 'beta.sudokupad.app', value: 'https://beta.sudokupad.app/' },
		{ name: 'alpha.sudokupad.app', value: 'https://alpha.sudokupad.app/' },
	];

	function addConverterTarget(name: string, domain: string) {
		converterTargets.push({ name, value: domain });
	}

	// getters: {
	// 	// version: () => 'v1.2.3',
	// 	// title(): string {
	// 	// 	return 'SudokuPad Penpa+ Importer' + this.version;
	// 	// },
	// },
	// actions: {
	// 	showSettings(show: boolean) {
	// 		this.settingsVisible = show;
	// 	},
	// 	setErrorMessage(msg: string) {
	// 		this.errorMessage = '';
	// 		nextTick(() => (this.errorMessage = msg)); //force reactive re-trigger
	// 	},
	// },

	return {
		settingsVisible,
		errorMessage,
		inputUrl,
		outputUrl,
		converting,
		selectedTarget,
		selectedAction,
		selectedFlags,

		converterTargets,
		addConverterTarget
	};
});
