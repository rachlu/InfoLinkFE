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
  background-color: lightblue; /* Set the background color to light blue */
  border-radius: 1em; /* Add rounded edges with a border radius value */
  padding: 0.4em; /* Add padding to create space between text and the border */
  display: inline-block; /* Optional, makes the div only as wide as its content */
}

p {
  border-radius: 1em;
  display: inline;
  gap: 0.5em;
  padding: 0.5em;
}
</style>
