<script setup lang="ts">
import { ref } from 'vue';

import type { MenuItemCommandEvent } from 'primevue/menuitem';
import type { BasicColorSchema } from '@vueuse/core/index.cjs';
import { useAppState } from '@/stores/appState';
import { nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { appearenceIcon, icons } from '@/composables/useAppearance';

const appState = useAppState();
const { appearance } = storeToRefs(appState);

const menu = ref();
const toggleAppearanceMenu = async (event: any) => {
	menu.value.toggle(event);
	await nextTick(() => {
		let index = appearanceMenuItems[0].items.findIndex(item => item.key === appearance.value);
		menu.value.changeFocusedOptionIndex(index);
	});
};

const appearanceMenuItems = [
	{
		//label: 'Appearance',
		items: [
			{
				key: 'light',
				label: 'Light theme',
				html: icons.light,
				command: changeTheme,
			},
			{
				key: 'dark',
				label: 'Dark theme',
				html: icons.dark,
				command: changeTheme,
			},
			{
				key: 'auto',
				label: 'Device default',
				html: icons.auto,
				command: changeTheme,
			},
		],
	},
];

function changeTheme(event: MenuItemCommandEvent) {
	if (event.item.key) {
		appearance.value = event.item.key as BasicColorSchema;
	}
}
</script>

<template>
	<div class="flex flex-column gap-4">
		<!-- <div class="m-10"></div> -->
		<label class="flex align-items-center gap-2">
			<ToggleSwitch v-model="appState.settingsVisible" />
			<div>Show Converter Options</div>
		</label>
		<div>
			<Button @click="toggleAppearanceMenu">
				<div class="flex align-items-center gap-2">
					<span class="flex align-items-center" v-html="appearenceIcon"></span>
					<span>Appearence</span>
				</div>
			</Button>
			<Menu ref="menu" id="overlay_menu" :model="appearanceMenuItems" :popup="true">
				<template #item="{ item, props }">
					<a v-bind="props.action">
						<span class="flex align-items-center mr-2" v-html="item.html"></span>
						<span>{{ item.label }}</span>
					</a>
				</template>
			</Menu>
		</div>
	</div>
</template>
