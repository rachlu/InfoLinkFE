<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername } = storeToRefs(useUserStore());
const { updateSession } = useUserStore();

void updateSession();
</script>

<template>
  <main>
    <h1>{{ currentUsername }}</h1>
    <PostListComponent :own="true" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
