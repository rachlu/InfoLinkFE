<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const props = defineProps(["post"]);
const emit = defineEmits(["refreshTags"]);

const createTag = async (content: string) => {
  console.log(`Creating new tag ${content}`);
  try {
    await fetchy(`/api/tags/${content}/${props.post._id}`, "POST");
  } catch (e) {
    console.log(e);
    return;
  }
  console.log("Success");
  emit("refreshTags");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createTag(content)">
    <label for="content">Tag:</label>
    <textarea id="content" v-model="content" placeholder="Add Tag" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Tag</button>
  </form>
</template>
