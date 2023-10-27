<script setup lang="ts">
import { ref } from "vue";
import TagComponent from "./TagComponent.vue";

const content = ref("");
const props = defineProps(["tags"]);

const addTag = async (content: string) => {
  props.tags.add(content.toLocaleLowerCase());
  emptyForm();
};

const deleteTag = async (content: string) => {
  props.tags.delete(content);
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="addTag(content)">
    <label for="content">Tags: </label>
    <section v-if="tags.size !== 0">
      <article class="tag" v-for="tag in tags" :key="tag">
        <TagComponent :tag="tag" :creation="true" @deleteTag="deleteTag" />
      </article>
    </section>
    <textarea id="content" v-model="content" placeholder="Add Tag" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Add Tag</button>
  </form>
</template>

<style scoped>
.tag {
  display: inline-block;
  margin-right: 0.5em;
}
</style>
