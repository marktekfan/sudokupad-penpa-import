<script setup lang="ts">
import type { Metadata } from '@/edit-metadata';

const emit = defineEmits(['update']);

const model = defineModel<Metadata>({ default: {} });

function saveClick() {
	close();
	emit('update', model);
}

function close() {
	model.value.dialogVisible = false;
}
</script>

<template>
	<Dialog v-model:visible="model.dialogVisible" modal header="Edit Profile">
		<template #header>
			<div class="inline-flex items-center justify-center gap-2">
				<span class="font-bold whitespace-nowrap text-2xl">Puzzle Metadata</span>
			</div>
		</template>
		<div class="flex flex-column align-items-left gap-1 mb-3">
			<label for="title" class="font-semibold w-24">Title</label>
			<InputText id="title" class="shadow-2" autocomplete="off" v-model="model.title" />
		</div>
		<div class="flex flex-column align-items-left gap-1 mb-3">
			<label for="author" class="font-semibold w-24">Author</label>
			<InputText id="author" class="shadow-2" autocomplete="off" v-model="model.author" />
		</div>
		<div class="flex flex-column align-items-left gap-1 mb-3">
			<label for="rules" class="font-semibold w-24">Rules</label>
			<Textarea id="rules" class="shadow-2" v-model="model.rules" rows="20" />
		</div>
		<div v-if="model.msgcorrect != null" class="flex flex-column align-items-left gap-1 mb-3">
			<label for="msgcorrect" class="font-semibold w-24">Solution Message</label>
			<Textarea id="msgcorrect" class="shadow-2" spellcheck="false" v-model="model.msgcorrect" xrows="3" />
		</div>
		<template #footer>
			<div class="inline-flex items-center justify-center gap-4 pt-2">
				<Button label="Cancel" outlined severity="secondary" @click="close" autofocus />
				<Button label="Save" @click="saveClick" autofocus />
			</div>
		</template>
	</Dialog>
</template>

<style scoped>
textarea {
	resize: both;
	width: min(55rem, 90vw);
	min-height: 3rem;
	word-break: break-word;
}
</style>
