<script setup lang="ts">
import { ref } from "vue";
import { createTag, fetchy } from "../../utils/fetchy";
import CreateTagForm from "../Tag/CreateTagForm.vue";

const content = ref("");
const emit = defineEmits(["refreshPosts", "refreshCommunity"]);
const tags = ref<Set<string>>(new Set());
const popup = ref(false);
const msg = ref("");

const createPost = async (content: string) => {
  if (tags.value.size == 0) {
    popup.value = true;
    msg.value = "All Posts must have at least one Tag!";
    return;
  }

  if (tags.value.has("community") && tags.value.size < 2) {
    popup.value = true;
    msg.value = "Community Posts must contain another tag other than community!";
    return;
  }
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
    promises.push(createTag(tag.toLowerCase(), result.postID));
  }
  await Promise.all(promises);

  if (tags.value.has("community")) {
    try {
      await fetchy(`/api/edits/${result.postID}`, "POST", {
        body: { content },
      });
    } catch {
      return;
    }
  }

  tags.value = new Set();
  emit("refreshPosts");
  emit("refreshCommunity");
};

const closePopup = async () => {
  popup.value = false;
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <div class="popup" v-if="popup">
    <div class="popup-content">{{ msg }}</div>
    <button @click="closePopup">OK</button>
  </div>
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

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.popup-content {
  background: lightcoral;
  padding: 1em;
  border-radius: 2em;
  box-shadow: 0 0.1em 0.4em rgba(0, 0, 0, 0.2);
  text-align: center;
  color: white;
}
</style>
