import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	// plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	// hosted at: https://marktekfan.github.io/sudokupad-penpa-import/
	base: '/sudokupad-penpa-import/',
});
