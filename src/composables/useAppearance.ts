import SvgThemeLight from '@/assets/theme-light.svg?raw';
import SvgThemeDark from '@/assets/theme-dark.svg?raw';
import SvgThemeDefault from '@/assets/theme-default.svg?raw';

import { usePreferredDark, useStorage } from '@vueuse/core';
import { ref, watch } from 'vue';
import type { BasicColorSchema } from '@vueuse/core/index.cjs';

import { updatePrimaryPalette } from '@primevue/themes';
import { palette } from '@primevue/themes';

export const appearenceIcon = ref('');

export const icons: Record<BasicColorSchema, string> = {
	light: SvgThemeLight,
	dark: SvgThemeDark,
	auto: SvgThemeDefault,
};

export function useAppearance() {
	const preferredDark = usePreferredDark();
	const appearance = useStorage<BasicColorSchema>('appearance', 'auto');
	const themePalette = useStorage<string>('palette', 'amber');
	watch(appearance, newVal => {
		if (newVal === 'auto') newVal = preferredDark ? 'dark' : 'light';
		const element = document.querySelector('html');
		element?.classList.toggle('my-app-dark', newVal === 'dark');
	});

	watch(themePalette, newVal => {
		updatePrimaryPalette(palette(`{${newVal}}`));
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
