<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";
import TagComponent from "./TagComponent.vue";

const loaded = ref(false);
const props = defineProps(["post", "cut", "creation"]);
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

watch(
  () => props.post._id,
  async () => {
    await getTags();
  },
);
</script>

<template>
  <section v-if="loaded && tags.length !== 0">
    <div class="tag-container" v-if="props.cut">
      <article class="tag" v-for="tag in tags" :key="tag._id">
        <TagComponent :tag="tag" :creation="props.creation" />
      </article>
    </div>
    <div v-else>
      <article class="tag" v-for="tag in tags" :key="tag._id">
        <TagComponent :tag="tag" :creation="props.creation" />
      </article>
    </div>
  </section>
</template>

<style scoped>
.tag {
  display: inline-block;
  margin-right: 0.5em;
  max-width: 8em;
}
.tag-container {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
