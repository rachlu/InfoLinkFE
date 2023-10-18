<script setup lang="ts">
import { MDBBtnClose } from "mdb-vue-ui-kit";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["tag", "post"]);
const emit = defineEmits(["refreshTags"]);

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
    <MDBBtnClose @click="deleteTag" />
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
