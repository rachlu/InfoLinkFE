<script setup lang="ts">
const props = defineProps(["tag", "creation"]);
const emit = defineEmits(["deleteTag"]);

const deleteTag = async () => {
  emit("deleteTag", props.tag);
};
</script>

<template>
  <article class="tag">
    <p>#{{ props.tag }}</p>
    <p v-if="props.creation">
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
