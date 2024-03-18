import SvgThemeLight from '@/assets/theme-light.svg?raw';
import SvgThemeDark from '@/assets/theme-dark.svg?raw';
import SvgThemeDefault from '@/assets/theme-default.svg?raw';

import { usePreferredDark, useStorage } from '@vueuse/core';
import { usePrimeVue } from 'primevue/config';
import { ref, watch } from 'vue';
import type { BasicColorSchema } from '@vueuse/core/index.cjs';

export const appearenceIcon = ref('');

export const icons: Record<BasicColorSchema, string> = {
	light: SvgThemeLight,
	dark: SvgThemeDark,
	auto: SvgThemeDefault,
};

export function useAppearance(storageName = 'appearance') {
	const preferredDark = usePreferredDark();
	const appearance = useStorage<BasicColorSchema>(storageName, 'auto');
	const primeVue = usePrimeVue();
	watch(appearance, (newVal, oldVal) => {
		//console.log(newVal, oldVal);
		if (oldVal === 'auto') oldVal = preferredDark ? 'dark' : 'light';
		if (newVal === 'auto') newVal = preferredDark ? 'dark' : 'light';
		if (newVal !== oldVal) {
			if (newVal === 'light') {
				primeVue.changeTheme('dark', 'light', 'theme-link');
			} else if (newVal === 'dark') {
				primeVue.changeTheme('light', 'dark', 'theme-link');
			}
		}
	});

	watch(
		appearance,
		() => {
			appearenceIcon.value = icons[appearance.value];
		},
		{ immediate: true }
	);

	return appearance;
}
