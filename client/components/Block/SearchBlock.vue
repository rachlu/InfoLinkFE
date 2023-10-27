<script setup lang="ts">
import { ref } from "vue";

const tag = ref("");
const emit = defineEmits(["getByTag"]);
</script>

<template>
  <form @submit.prevent="emit('getByTag', tag)" class="pure-form">
    <fieldset>
      <legend>Search by Tag</legend>
      <input id="tag" type="text" v-model="tag" placeholder="Tag" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
