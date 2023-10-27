<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import TimeoutComponent from "@/components/Timeout/TimeoutComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useTimeoutStore } from "../stores/timeout";
import { useVerifyStore } from "../stores/verified";

import HelpComponent from "../components/HelpComponent.vue";
import { fetchy } from "../utils/fetchy";

const { currentUsername, currentUserID } = storeToRefs(useUserStore());
const { updateSession } = useUserStore();
const { timeoutUsers } = storeToRefs(useTimeoutStore());
const { updateTimeoutUsers, getExpireDate } = useTimeoutStore();

const { updateVerifiedTags } = useVerifyStore();
const { verifiedTags } = storeToRefs(useVerifyStore());

let expireDate = ref();

let likes = ref<Array<string>>([]);
let loaded = ref(false);

const editedTags = ref<Map<string, boolean>>(new Map<string, boolean>());

const getLikes = async () => {
  let likeResults;
  try {
    likeResults = await fetchy("/api/count", "GET");
  } catch {
    return;
  }
  likes.value = likeResults;
};

const loadVerifiedTags = async () => {
  for (const like of likes.value) {
    editedTags.value.set(like, verifiedTags.value.includes(like.split(":")[0]));
  }
};

onBeforeMount(async () => {
  await updateTimeoutUsers();
  await getLikes();
  await updateVerifiedTags();
  await loadVerifiedTags();
  expireDate.value = await getExpireDate(currentUserID.value);
  loaded.value = true;
});

void updateSession();
</script>

<template>
  <div v-if="timeoutUsers.includes(currentUserID)">
    <TimeoutComponent />
  </div>
  <main>
    <h1>{{ currentUsername }}</h1>
    <section class="likes" v-if="loaded && likes.length !== 0">
      <p>Verify Status</p>
      <HelpComponent :msg="'If verified for a tag, you can approve/disapprove reported posts/edits! Head over to Reports Tab!'" />
      <article v-for="like in likes" :key="like" class="like">
        {{ like }}
        <div v-if="editedTags.get(like)">Verified!</div>
      </article>
    </section>
    <PostListComponent :own="true" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.likes {
  display: flex;
  flex-wrap: wrap; /* Allows likes to wrap to the next line if there are too many */
  justify-content: center; /* Center the likes horizontally */
  width: 80%; /* Set the section width as needed */
  margin: 0 auto; /* Center the section within its parent container */
  text-align: center; /* Center the likes content within each article */
}

.like {
  background-color: #f2f2f2;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin: 5px;
  width: 200px; /* Set the width of each "like" article as needed */
}
</style>
