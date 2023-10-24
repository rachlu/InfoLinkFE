<script setup lang="ts">
import CommentListComponent from "@/components/Comment/CommentListComponent.vue";
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useTimeoutStore } from "../../stores/timeout";
import SearchPostForm from "./SearchPostForm.vue";

const { currentUsername, currentUserID, isLoggedIn } = storeToRefs(useUserStore());
const { timeoutUsers } = storeToRefs(useTimeoutStore());
const { updateTimeoutUsers, getExpireDate } = useTimeoutStore();

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let searchTag = ref("");
let display = ref(false);
let displayPost = ref();
let expireDate = ref();
const props = defineProps(["own"]);

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchTag.value = "";
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

async function getPostsByTags(tag?: string) {
  let query: Record<string, string> = tag !== undefined ? { tag } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchTag.value = tag ? tag : "";
  searchAuthor.value = "";
  if (props.own) {
    await getPosts(currentUsername.value);
  }
  postResults = postResults.filter((post1: Record<string, string>) => posts.value.some((post2) => post1._id == post2._id));
  posts.value = postResults;
}

function clickedPost(postClick: Record<string, string>) {
  display.value = true;
  displayPost.value = postClick;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  if (props.own) {
    await getPosts(currentUsername.value);
  } else {
    await getPosts();
  }
  loaded.value = true;
  await updateTimeoutUsers();
  expireDate.value = await getExpireDate(currentUserID.value);
});
</script>

<template>
  <section v-if="isLoggedIn && !props.own">
    <div class="blocked" v-if="timeoutUsers.includes(currentUserID)">Blocked Until {{ expireDate }}</div>
    <div v-else>
      <h2>Create a post:</h2>
      <CreatePostForm @refreshPosts="getPosts" />
    </div>
  </section>
  <div class="row">
    <h2 v-if="searchAuthor">Posts by {{ searchAuthor }}:</h2>
    <h2 v-else-if="searchTag">Posts with Tag {{ searchTag }}:</h2>
    <h2 v-else>Posts:</h2>
    <SearchPostForm :own="props.own" @getPostsByAuthor="getPosts" @getPostsByTags="getPostsByTags" />
  </div>
  <div class="container">
    <div class="left-column">
      <section class="posts" v-if="loaded && posts.length !== 0">
        <article v-for="post in posts" :key="post._id">
          <PostComponent :click="true" @click="clickedPost(post)" :cut="true" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" @clickedPost="clickedPost" />
        </article>
      </section>
      <p v-else-if="loaded">No posts found</p>
      <p v-else>Loading...</p>
    </div>
    <div class="right-column">
      <section v-if="display">
        <PostComponent :click="false" v-if="editing !== displayPost._id" :cut="false" :post="displayPost" @refreshPosts="getPosts" @editPost="updateEditing" />
        <EditPostForm :post="displayPost" v-else @refreshPosts="getPosts" @editPost="updateEditing" />
        <CommentListComponent :own="props.own" :post="displayPost" />
      </section>
      <p v-else>No Post Clicked</p>
    </div>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
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

.posts {
  padding: 1em;
  max-height: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.container {
  display: flex;
}

.left-column {
  flex: 1;
  width: 25%;
  height: 60em;
  overflow: auto;
  padding: 0.1em;
}
.right-column {
  flex: 3;
  height: 60em;
  overflow: auto;
  padding: 0.1em;
}

.blocked {
  background-color: lightcoral;
  color: white;
  font-size: 2em;
  padding: 0.1em;
  text-align: center;
}
</style>
