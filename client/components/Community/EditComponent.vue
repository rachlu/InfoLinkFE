<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["edit", "click"]);
const emit = defineEmits(["refreshCommunity", "deleteEdit"]);
const { currentUserID } = storeToRefs(useUserStore());

const deleteEdit = async () => {
  let result;
  try {
    result = await fetchy(`/api/edits/${props.edit._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshCommunity");
  if (result.noneLeft) {
    emit("deleteEdit");
  }
};

const refreshPost = async () => {
  emit("refreshCommunity");
};

onBeforeMount(async () => {});
</script>

<template>
  <div v-if="props.edit">
    <div :class="props.click && 'fade-paragraph'">
      <p>{{ props.edit.content }}</p>
    </div>
    <div class="base">
      <menu v-if="props.edit.author == currentUserID">
        <li><button class="button-error btn-small pure-button" @click="deleteEdit">Delete</button></li>
      </menu>
      <article class="timestamp">
        <p v-if="props.edit.dateCreated !== props.edit.dateUpdated">Edited on: {{ formatDate(props.edit.dateUpdated) }}</p>
        <p v-else>Created on: {{ formatDate(props.edit.dateCreated) }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 1em;
}

.title {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.fade-paragraph {
  overflow: hidden;
  position: relative;
}

.report {
  display: flex;
  gap: 0.5em;
  justify-content: flex-end;
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
