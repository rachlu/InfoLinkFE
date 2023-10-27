<script setup lang="ts">
import CommentListComponent from "@/components/Comment/CommentListComponent.vue";
import CommunityComponent from "@/components/Community/CommunityComponent.vue";
import CreateEditComponent from "@/components/Community/CreateEditComponent.vue";
import HelpComponent from "@/components/HelpComponent.vue";
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import TimeoutComponent from "@/components/Timeout/TimeoutComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useBlockStore } from "../../stores/blocked";
import { useCommunityStore } from "../../stores/community";
import { useTimeoutStore } from "../../stores/timeout";
import SearchPostForm from "./SearchPostForm.vue";

const { currentUsername, currentUserID, isLoggedIn } = storeToRefs(useUserStore());
const { timeoutUsers } = storeToRefs(useTimeoutStore());
const { updateCommunityPosts } = useCommunityStore();
const { communityIDs } = storeToRefs(useCommunityStore());

const { updateBlockedPosts } = useBlockStore();
const { blockedPosts } = storeToRefs(useBlockStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let searchTag = ref("");
let display = ref(false);
let displayPost = ref();
const props = defineProps(["own"]);

async function getPosts(author?: string, clear?: boolean) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchTag.value = "";
  searchAuthor.value = author ? author : "";
  await updateCommunityPosts();
  posts.value = postResults;
  if (clear) {
    display.value = false;
  }
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
  await updateCommunityPosts();
  await updateBlockedPosts();
});
</script>

<template>
  <section v-if="isLoggedIn && !props.own">
    <div v-if="timeoutUsers.includes(currentUserID)">
      <TimeoutComponent />
    </div>
    <div v-else>
      <h2>Create a post:</h2>
      <CreatePostForm @refreshPosts="getPosts" @refreshCommunity="updateCommunityPosts" />
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
          <div v-if="!blockedPosts.includes(post._id)">
            <div v-if="communityIDs.includes(post._id)">
              <CommunityComponent :post="post" :click="true" :cut="true" @click="clickedPost(post)" @refreshPosts="getPosts" />
            </div>
            <div v-else>
              <PostComponent
                :click="true"
                @click="clickedPost(post)"
                :cut="true"
                :post="post"
                @refreshPosts="getPosts"
                @refreshCommunity="updateCommunityPosts"
                @editPost="updateEditing"
                @clickedPost="clickedPost"
              />
            </div>
          </div>
          <div v-else class="help">
            <p>Blocked Post!</p>
            <HelpComponent :msg="'Number of Reports of the Post Exceeded Cap. Have verified users approve/disapprove post'" />
          </div>
        </article>
      </section>
      <p v-else-if="loaded">No posts found</p>
      <p v-else>Loading...</p>
    </div>
    <div class="right-column">
      <section v-if="display">
        <div v-if="communityIDs.includes(displayPost._id)">
          <CommunityComponent :post="displayPost" :click="false" :cut="false" @click="clickedPost(displayPost)" @refreshPosts="getPosts" />
          <CreateEditComponent :post="displayPost" @refreshEdits="updateCommunityPosts" @refreshPosts="getPosts" />
        </div>
        <div v-else>
          <PostComponent v-if="editing !== displayPost._id" :click="false" :cut="false" :post="displayPost" @refreshPosts="getPosts" @editPost="updateEditing" />
          <EditPostForm v-else :post="displayPost" @refreshPosts="getPosts" @editPost="updateEditing" />
          <CommentListComponent :own="props.own" :post="displayPost" :timeout="timeoutUsers.includes(currentUserID)" />
        </div>
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

.help {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
  align-items: flex-end;
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
</style>
