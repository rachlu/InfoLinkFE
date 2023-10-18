<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";
import CreateTagForm from "./CreateTagForm.vue";
import TagComponent from "./TagComponent.vue";

const loaded = ref(false);
const props = defineProps(["post"]);
const emit = defineEmits(["createTag"]);
let tags = ref<Array<Record<string, string>>>([]);
const { currentUsername } = storeToRefs(useUserStore());

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
      <TagComponent :tag="tag" :post="post" @refreshTags="getTags" />
    </article>
  </section>
  <section v-if="props.post.author == currentUsername">
    <CreateTagForm :post="post" @refreshTags="getTags" />
  </section>
</template>
