import { useAppearance } from '@/composables/useAppearance';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AppAction = 'open' | 'create-url' | 'convert-tojson' | '-';

export const useAppState = defineStore('AppState', () => {
	const errorMessage = ref('');
	const inputUrl = ref('');
	const outputUrl = ref('');
	const converting = ref(false);
	const selectedTarget = ref('');
	const selectedAction = ref<AppAction>('open');
	const selectedFlags = ref<string[]>([]);
	const testMode = ref(false);

	const settingsVisible = useStorage('settingsVisible', false);

	const converterTargets = [
		{ name: 'sudokupad.app', value: 'https://sudokupad.app/' },
		{ name: 'beta.sudokupad.app', value: 'https://beta.sudokupad.app/' },
		{ name: 'alpha.sudokupad.app', value: 'https://alpha.sudokupad.app/' },
	];

	function addConverterTarget(domain: string, name: string = '') {
		if (!name) name = domain;
		converterTargets.push({ name, value: domain });
	}

	const appearance = useAppearance();
	
	return {
		errorMessage,
		inputUrl,
		outputUrl,
		converting,
		selectedTarget,
		selectedAction,
		selectedFlags,

		testMode,

		settingsVisible,
		appearance,

		converterTargets,
		addConverterTarget,
	};
});
