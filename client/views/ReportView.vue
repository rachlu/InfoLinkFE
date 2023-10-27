<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import { useVerifyStore } from "../stores/verified";

import SearchBlock from "@/components/Block/SearchBlock.vue";
import { fetchy } from "../utils/fetchy";

import BlockComponent from "@/components/Block/BlockComponent.vue";
const { updateVerifiedTags } = useVerifyStore();
const { verifiedTags } = storeToRefs(useVerifyStore());

const { currentUsername, currentUserID } = storeToRefs(useUserStore());

const post = ref(false);
const edits = ref(false);
const loaded = ref(false);
let items = ref<Array<Record<string, string>>>([]);
const objType = ref("");
let tagRef = ref("");

const handleButtonClick = async (buttonName: string) => {
  if (buttonName === "post") {
    post.value = true;
    edits.value = false;
    objType.value = "posts";
  } else if (buttonName === "edit") {
    post.value = false;
    edits.value = true;
    objType.value = "edits";
  }
};

const getItems = async (tag?: string) => {
  if (tag == null) {
    items.value = [];
    tagRef.value = "";
    return;
  }
  tagRef.value = tag;
  let results;
  if (post.value) {
    const posts = await fetchy("/api/posts", "GET");
    const ids = await fetchy(`/api/blocks/posts/${tag}`, "GET");
    results = posts.filter((item: Record<string, string>) => ids.includes(item._id));
  } else if (edits.value) {
    const edits = await fetchy("/api/edits", "GET");
    const ids = await fetchy(`/api/blocks/edits/${tag}`, "GET");
    results = edits.filter((item: Record<string, string>) => ids.includes(item._id));
  }
  items.value = results;
  loaded.value = true;
};
</script>

<template>
  <main>
    <h1>{{ currentUsername }}</h1>
  </main>
  <div class="row">
    <div v-if="post || edits">
      <SearchBlock @getByTag="getItems" />
    </div>
    <button @click="handleButtonClick('post')" :class="{ active: post }">Post</button>
    <!-- <button @click="handleButtonClick('edit')" :class="{ active: edits }">Edit</button> -->
    <p v-if="post">Post Selected!</p>
    <!-- <p v-else-if="edits">Edits Selected!</p> -->
  </div>
  <div class="container">
    <section class="items" v-if="loaded && items.length !== 0">
      <div v-if="!verifiedTags.includes(tagRef)">
        <h1>Not Verified for {{ tagRef }}</h1>
      </div>
      <article v-else v-for="item in items" :key="item._id">
        <div v-if="item.author !== currentUserID && item.author !== currentUsername">
          <BlockComponent :item="item" :objType="objType" @update="getItems" />
        </div>
        <div v-else>Blocked Item is Current User's Item!</div>
      </article>
    </section>
    <h1 v-if="!post && !edits">Click an Item Type!</h1>
    <h1 v-if="loaded && items.length == 0">No {{ objType }} Found!</h1>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

.row {
  margin: 0 auto;
  max-width: 60em;
}
.items {
  padding: 1em;
  max-height: 1em;
}
</style>
