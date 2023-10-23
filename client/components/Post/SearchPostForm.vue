<script setup lang="ts">
import { ref } from "vue";

const author = ref("");
const tag = ref("");
const props = defineProps(["own"]);
const emit = defineEmits(["getPostsByAuthor", "getPostsByTags"]);
</script>

<template>
  <form v-if="!props.own" @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form">
    <fieldset>
      <legend>Search by Author</legend>
      <input id="author" type="text" v-model="author" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>

  <form @submit.prevent="emit('getPostsByTags', tag)" class="pure-form">
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
