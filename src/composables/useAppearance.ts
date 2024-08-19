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

	function getAppearance(preference: BasicColorSchema) {
		switch (preference) {
			case 'light': return 'light'
			case 'dark': return 'dark'
			default: return preferredDark ? 'dark' : 'light';			
		}
	}

	watch(appearance, newVal => {
		const element = document.querySelector('html');
		element?.classList.toggle('my-app-dark', getAppearance(newVal) === 'dark');
	});

	function setPrismTheme(newVal: BasicColorSchema) {
		var light = `themes/prism-coy.css`;
		var dark = `themes/prism-okaidia.css`;
		// if the media query isn't supported, the light theme will be used
		var theme = getAppearance(newVal) === 'dark' ? dark : light;

		let link = (document.querySelector('link#prismjs-theme') as HTMLLinkElement) || document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = theme;
		link.id = 'prismjs-theme';
		document.head.appendChild(link); // add or move
	}

	watch(themePalette, newVal => {
		updatePrimaryPalette(palette(`{${newVal}}`));
	});

	watch(
		appearance,
		() => {
			appearenceIcon.value = icons[appearance.value];
			setPrismTheme(appearance.value);
		},
		{ immediate: true }
	);

	return appearance;
}
