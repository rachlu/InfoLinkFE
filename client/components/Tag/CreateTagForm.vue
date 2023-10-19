<script setup lang="ts">
import { ref } from "vue";
import TagComponent from "./TagComponent.vue";

const content = ref("");
const props = defineProps(["tags"]);

const addTag = async (content: string) => {
  console.log(`Adding new tag ${content}`);
  props.tags.add(content);
  console.log(props.tags);
  console.log("Success");
  emptyForm();
};

const deleteTag = async (content: string) => {
  console.log(`Adding new tag ${content}`);
  props.tags.delete(content);
  console.log(props.tags);
  console.log("Success");
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="addTag(content)">
    <label for="content">Tags: </label>
    <section class="tags" v-if="tags.size !== 0">
      <article v-for="tag in tags" :key="tag">
        <TagComponent :tag="tag" :creation="true" @deleteTag="deleteTag" />
      </article>
    </section>
    <textarea id="content" v-model="content" placeholder="Add Tag" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Add Tag</button>
  </form>
</template>
