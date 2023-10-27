<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useTimeoutStore } from "../../stores/timeout";
import HelpComponent from "../HelpComponent.vue";

const { currentUserID } = storeToRefs(useUserStore());
const { timeoutUsers } = storeToRefs(useTimeoutStore());
const { updateTimeoutUsers, getExpireDate } = useTimeoutStore();

let expireDate = ref();

onBeforeMount(async () => {
  await updateTimeoutUsers();
  expireDate.value = await getExpireDate(currentUserID.value);
});
</script>

<template>
  <div class="blocked">Blocked Until {{ expireDate }}</div>
  <div class="right">
    <HelpComponent :msg="'You can not interact until your block expires. You are blocked either due to being a new user or too many reports have been made on your content'" />
  </div>
</template>

<style>
.blocked {
  background-color: lightcoral;
  color: white;
  font-size: 2em;
  padding: 0.1em;
  text-align: center;
}

.right {
  display: flex;

  align-items: flex-end;
}
</style>
