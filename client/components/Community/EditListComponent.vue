<script setup lang="ts">
import { onBeforeMount, ref } from "vue";

import { storeToRefs } from "pinia";
import { useBlockStore } from "../../stores/blocked";

import EditComponent from "./EditComponent.vue";
const props = defineProps(["edits", "cut"]);
const emit = defineEmits(["getEdits", "deleteEdit"]);

let editing = ref("");
let display = ref(false);

const { updateBlockedEdits } = useBlockStore();
const { blockedEdits } = storeToRefs(useBlockStore());

const getEdits = async () => {
  emit("getEdits");
};

const deleteEdit = async () => {
  emit("deleteEdit");
};

onBeforeMount(async () => {
  //   await updateBlockedEdits();
});
</script>

<template>
  <div class="container">
    <div v-if="display"></div>
    <section class="edits" v-for="edit in props.edits" :key="edit._id">
      <EditComponent :click="false" :edit="edit" v-if="editing !== edit._id" :cut="false" :post="edits[0]" @refreshCommunity="getEdits" @deleteEdit="deleteEdit" />
    </section>
  </div>
</template>

<style scoped>
menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.like {
  display: flex;
  gap: 0.5em;
  justify-content: flex-end;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
  align-items: flex-end;
}
.base article:only-child {
  margin-left: auto;
}

.fade-paragraph {
  overflow: hidden;
  position: relative;
}

.fade-paragraph p {
  margin: 0;
  padding: 0;
  position: relative;
  line-height: 1.5;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  max-height: 10em;
}
</style>
