<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import TagComponent from "./TagComponent.vue";

const loaded = ref(false);
const props = defineProps(["post"]);
let tags = ref<Array<Record<string, string>>>([]);

const getTags = async () => {
  let tagResults;
  try {
    tagResults = await fetchy(`/api/tags/${props.post._id}`, "GET");
  } catch {
    return;
  }
  tags.value = tagResults;
};

onBeforeMount(async () => {
  await getTags();
  loaded.value = true;
});
</script>

<template>
  <section class="tags" v-if="loaded && tags.length !== 0">
    <article v-for="tag in tags" :key="tag._id">
      <TagComponent :tag="tag" :creation="false" />
    </article>
  </section>
</template>
