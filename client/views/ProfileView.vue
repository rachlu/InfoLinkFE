<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import TimeoutComponent from "@/components/Timeout/TimeoutComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useTimeoutStore } from "../stores/timeout";

const { currentUsername, currentUserID } = storeToRefs(useUserStore());
const { updateSession } = useUserStore();
const { timeoutUsers } = storeToRefs(useTimeoutStore());
const { updateTimeoutUsers, getExpireDate } = useTimeoutStore();

let expireDate = ref();

onBeforeMount(async () => {
  await updateTimeoutUsers();
  expireDate.value = await getExpireDate(currentUserID.value);
});

void updateSession();
</script>

<template>
  <div v-if="timeoutUsers.includes(currentUserID)">
    <TimeoutComponent />
  </div>
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
