import SvgThemeLight from '@/assets/theme-light.svg?raw';
import SvgThemeDark from '@/assets/theme-dark.svg?raw';
import SvgThemeDefault from '@/assets/theme-default.svg?raw';

import { usePreferredDark, useStorage } from '@vueuse/core';
import { ref, watch } from 'vue';
import type { BasicColorMode, BasicColorSchema } from '@vueuse/core/index.cjs';

import { updatePrimaryPalette } from '@primevue/themes';
import { palette } from '@primevue/themes';

export const appearenceIcon = ref('');

export const icons: Record<BasicColorSchema, string> = {
	light: SvgThemeLight,
	dark: SvgThemeDark,
	auto: SvgThemeDefault,
};

export function useAppearance() {
	const preferDark = usePreferredDark();
	const appearance = useStorage<BasicColorSchema>('appearance', 'auto');
	const themePalette = useStorage<string>('palette', 'amber');

	function getAppearance(preference: BasicColorSchema) : BasicColorMode {
		switch (preference) {
			case 'light': return 'light'
			case 'dark': return 'dark'
			default: return preferDark.value ? 'dark' : 'light';			
		}
	}

	function setPrismTheme(darkOrLight: BasicColorMode) {
		const cssLight = `themes/prism-coy.css`;
		const cssDark = `themes/prism-okaidia.css`;
		const cssTheme = darkOrLight === 'dark' ? cssDark : cssLight;

		const link = (document.querySelector('link#prismjs-theme') as HTMLLinkElement) || document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = cssTheme;
		link.id = 'prismjs-theme';
		document.head.appendChild(link); // add or move
	}

	watch(themePalette, newVal => {
		updatePrimaryPalette(palette(`{${newVal}}`));
	});

	watch(
		[appearance, preferDark],
		([newAppearance, _newPreferDark]) => {
			const element = document.querySelector('html');
			const darkOrLight = getAppearance(newAppearance);
			setPrismTheme(darkOrLight);
			element?.classList.toggle('my-app-dark', darkOrLight === 'dark');	
			appearenceIcon.value = icons[newAppearance];
		},
		{ immediate: true }
	);

	return appearance;
}
