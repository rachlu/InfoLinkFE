<script setup lang="ts">
import HelpComponent from "@/components/HelpComponent.vue";
import TagListComponent from "@/components/Tag/TagListComponent.vue";
import { onBeforeMount, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";

import EditComponent from "./EditComponent.vue";
import EditListComponent from "./EditListComponent.vue";

const props = defineProps(["post", "click", "cut"]);
const emits = defineEmits(["refreshPosts"]);
const loaded = ref(false);
let edits = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let display = ref(false);

const getEdits = async () => {
  let editResults;
  try {
    editResults = await fetchy(`/api/edits/${props.post._id}`, "GET");
  } catch {
    return;
  }
  edits.value = editResults;
};

const deleteEdit = async () => {
  emits("refreshPosts");
};

const displayEdits = async () => {
  display.value = true;
};

const closeDisplay = async () => {
  display.value = false;
};

onBeforeMount(async () => {
  loaded.value = true;
  await getEdits();
});

watch(
  () => props.post._id,
  async () => {
    await getEdits();
  },
);
</script>

<template>
  <div>
    <div class="popup" v-if="display">
      <article>
        <EditListComponent v-if="display" :edits="edits" :cut="true" @getEdits="getEdits" @deleteEdit="deleteEdit" />
      </article>
      <button @click="closeDisplay">X</button>
    </div>
    <div class="base">
      <menu>
        <HelpComponent :msg="'This is a community post where all users can collaborate to create a post!'" />
        <li><button v-if="!props.click" class="btn-small pure-button" @click="displayEdits()">See All Edits</button></li>
      </menu>
    </div>
    <TagListComponent :post="props.post" :cut="props.cut" :creation="false" />
    <div v-if="props.click">
      <p class="title">Community</p>
    </div>
    <div v-else>
      <EditComponent :click="false" :edit="edits[0]" :cut="false" @refreshCommunity="getEdits" @deleteEdit="deleteEdit" />
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.title {
  font-weight: bold;
  font-size: 1.2em;
  margin: 1em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 2em;
  padding: 2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
  align-items: flex-end;
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
  flex: 1;
  justify-content: flex-end;
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

.popup {
  position: fixed;
  top: 50%;
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element precisely */
  width: 50%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  z-index: center;
}
</style>
