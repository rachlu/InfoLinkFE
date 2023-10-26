<script setup lang="ts">
import TimeoutHelp from "@/components/Timeout/TimeoutHelp.vue";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import LikeComponent from "../Like/LikeComponent.vue";
import TagListComponent from "../Tag/TagListComponent.vue";
const props = defineProps(["post", "click", "cut"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const totalLikes = ref(0);

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

const updateLikes = async (total: number) => {
  totalLikes.value = total;
};
</script>

<template>
  <div>
    <menu>
      <TimeoutHelp />
    </menu>
    <TagListComponent :post="props.post" :cut="props.cut" :creation="false" />
    <p class="author">{{ props.post.author }}</p>
    <div :class="props.click && 'fade-paragraph'">
      <p>{{ props.post.content }}</p>
    </div>
    <div class="like" v-if="!props.click">
      <p>{{ totalLikes }}</p>
      <LikeComponent :type="'posts'" :id="props.post._id" @updateLikes="updateLikes" />
    </div>
    <div class="base">
      <menu v-if="props.post.author == currentUsername">
        <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
        <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
      </menu>
      <article class="timestamp">
        <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
        <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
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
