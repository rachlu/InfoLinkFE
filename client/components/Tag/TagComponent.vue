<script setup lang="ts">
const props = defineProps(["tag", "creation"]);
const emit = defineEmits(["deleteTag"]);

const deleteTag = async () => {
  emit("deleteTag", props.tag);
};
</script>

<template>
  <article>
    <div class="tag">
      <p>#{{ props.tag }}</p>
      <p v-if="props.creation">
        <button class="btn-small pure-button" @click="deleteTag">X</button>
      </p>
    </div>
  </article>
</template>

<style scoped>
.tag {
  background-color: lightblue;
  border-radius: 1em;
  padding: 0.4em;
  display: inline-block;
}

p {
  border-radius: 1em;
  display: inline;
  gap: 0.5em;
  padding: 0.5em;
}
</style>
