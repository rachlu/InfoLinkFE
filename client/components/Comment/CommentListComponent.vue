<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";
import EditCommentForm from "./EditCommentForm.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);
let editing = ref("");
const props = defineProps(["own", "post"]);

async function getComments(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let commentResults;
  try {
    commentResults = await fetchy(`/api/comments/${props.post._id}`, "GET", { query });
  } catch (_) {
    return;
  }
  comments.value = commentResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getComments();
  loaded.value = true;
});

watch(
  () => props.post._id,
  async () => {
    await getComments();
  },
);
</script>

<template>
  <section v-if="isLoggedIn && !props.own">
    <CreateCommentForm :post="props.post" @refreshComments="getComments" />
  </section>
  <div class="container">
    <section class="comments" v-if="loaded && comments.length !== 0">
      <article v-for="comment in comments" :key="comment._id">
        <CommentComponent v-if="editing !== comment._id" :comment="comment" @refreshComments="getComments" @editComment="updateEditing" />
        <EditCommentForm v-else :comment="comment" @refreshComments="getComments" @editComment="updateEditing" />
      </article>
    </section>
    <p v-else-if="loaded">No comments found</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

article:hover {
  background-color: lightgray;
}

.comments {
  padding: 1em;
  max-height: 50vh;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.container {
  display: flex;
  overflow: auto;
}
</style>
