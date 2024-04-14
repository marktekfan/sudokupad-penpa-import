<script setup lang="ts">
import { ref } from 'vue';
import TheAppMenu from '@/components/TheAppMenu.vue';
import { AppVersion } from '@/appversion';

const sidebarVisible = ref(false);
</script>

<template>
	<Sidebar v-model:visible="sidebarVisible" header="App Settings">
		<template #header>
			<div class="p-sidebar-header-content"  @click="$emit('hide')">App Settings</div>
		</template>
		<TheAppMenu />
	</Sidebar>
	<Toolbar class="border-noround border-none bg-primary p-1">
		<template #start>
			<Button
				icon="pi pi-bars text-xl"
				@click="sidebarVisible = true"
				class="mx-1"
				v-tooltip="{ value: 'App Settings', showDelay: 600, hideDelay: 300 }"
			></Button>
			<img src="/appicon.png" style="height: 40px;" />
			<div class="text-2xl font-bold pl-3">{{AppVersion.name}}</div>
			<div class="text-basefont-bold pl-3 pr-1 pt-1">v{{AppVersion.version}}</div>
		</template>
	</Toolbar>
</template>
