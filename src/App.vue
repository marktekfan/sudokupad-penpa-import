<script setup lang="ts">
import TheAppBar from '@/components/TheAppBar.vue';

import { useToast } from 'primevue/usetoast';
import { useUniqueToast } from '@/composables/useUniqueToast';
import TheConverter from './components/TheConverter.vue';

const toast = useUniqueToast(useToast());
</script>

<!-- ====================================================================== -->

<template>
	<TheAppBar />
	<Toast position="top-right" :pt="{ container: { class: 'shadow-6 border-left-3' } }" @close="toast.onClose" />
	<TheConverter />
</template>

<!-- ====================================================================== -->

<style>
html {
	font-size: 1rem;
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

.p-toast.p-toast-top-right {
	right: max(20px, 100% - 80rem) !important;
}
</style>
