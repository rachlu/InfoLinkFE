<script setup lang="ts">
import ClickedPost from "@/components/Post/ClickedPost.vue";
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let searchTag = ref("");
let display = ref(false);
let displayPost = ref();
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
  display.value = false;
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
  posts.value = postResults;
}

async function clickedPost(postClick: Record<string, string>) {
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
});
</script>

<template>
  <section v-if="isLoggedIn && !props.own">
    <h2>Create a post:</h2>
    <CreatePostForm @refreshPosts="getPosts" />
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
          <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" @clickedPost="clickedPost" />
          <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
        </article>
      </section>
      <p v-else-if="loaded">No posts found</p>
      <p v-else>Loading...</p>
    </div>
    <div class="right-column">
      <section v-if="display">
        <ClickedPost :post="displayPost" @refreshPosts="getPosts" @editPost="updateEditing" />
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

.posts {
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
}

.left-column {
  flex: 1;
  width: 25%; /* Adjust the width as needed to make it thinner */
  height: 400px;
  overflow: auto;
  padding: 10px;
}
.right-column {
  flex: 3; /* Adjust the flex value to make it wider */
  height: 400px;
  overflow: auto;
  padding: 10px;
}
</style>
