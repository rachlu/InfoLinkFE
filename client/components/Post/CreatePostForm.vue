<script setup lang="ts">
import { ref } from "vue";
import { createTag, fetchy } from "../../utils/fetchy";
import CreateTagForm from "../Tag/CreateTagForm.vue";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);
const tags = ref<Set<string>>(new Set());

const createPost = async (content: string) => {
  let result;
  try {
    result = await fetchy("/api/posts", "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emptyForm();
  const promises = [];
  for (const tag of tags.value) {
    promises.push(createTag(tag, result.postID));
  }
  await Promise.all(promises);

  tags.value = new Set();
  emit("refreshPosts");
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <CreateTagForm :tags="tags" />
  <form @submit.prevent="createPost(content)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
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
