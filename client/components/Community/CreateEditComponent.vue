<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshEdits", "refreshPosts"]);
const props = defineProps(["post"]);

const createEdit = async (content: string) => {
  try {
    await fetchy(`/api/edits/${props.post._id}`, "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emptyForm();
  emit("refreshEdits");
  emit("refreshPosts");
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createEdit(content)">
    <label for="content">Create New Edit:</label>
    <textarea id="content" v-model="content" placeholder="Insert Edit!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Edit</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
