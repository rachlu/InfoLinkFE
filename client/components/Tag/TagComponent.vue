<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["tag", "post"]);
const emit = defineEmits(["refreshTags"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteTag = async () => {
  try {
    await fetchy(`/api/tags/${props.tag}/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshTags");
};
</script>

<template>
  <article class="tag">
    <p>#{{ props.tag }}</p>
    <p v-if="props.post.author == currentUsername">
      <button class="btn-small pure-button" @click="deleteTag">X</button>
    </p>
  </article>
</template>

<style scoped>
.tag {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}
</style>
