<template>
  <Sidebar v-model:visible="sidebarVisible" header="Settings">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <InputSwitch
      v-model="showsettings"
      @change="switchTheme"
      :pt="{
        slider: ({ props }) => ({
          class: props.modelValue ? 'bg-teal-400' : 'bg-red-400',
        }),
      }"
    />
  </Sidebar>
  <Toolbar class="border-noround border-none bg-primary p-1">
    <template #start>
      <Button
        icon="pi pi-bars text-xl"
        @click="sidebarVisible = true"
        class="mx-1"
        v-tooltip="{ value: 'Settings', showDelay: 600, hideDelay: 300 }"
      ></Button>
      <img src="/appicon.png" class="appbar-icon" />
      <div class="text-2xl font-bold pl-3">SudokuPad Penpa Converter</div>
      <div class="text-basefont-bold pl-3 pr-1 pt-1">v1.0.0</div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { usePrimeVue } from "primevue/config";
const primeVue = usePrimeVue();

// const PrimeVue = usePrimeVue();
// PrimeVue.changeTheme('light', 'dark', 'theme-link', () => {});

const sidebarVisible = ref(false);

const showsettings = ref(true);

const darkMode = ref(true);
function switchTheme() {
  darkMode.value = !darkMode.value;
  if (darkMode.value) {
    primeVue.changeTheme("light", "dark", "theme-link", () => {});
  } else {
    primeVue.changeTheme("dark", "light", "theme-link", () => {});
  }
}
</script>

<style scoped>
.appbar-icon {
    height: 40px;
}
</style>