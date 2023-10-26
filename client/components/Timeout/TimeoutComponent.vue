<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useTimeoutStore } from "../../stores/timeout";

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
</template>

<style>
.blocked {
  background-color: lightcoral;
  color: white;
  font-size: 2em;
  padding: 0.1em;
  text-align: center;
}
</style>
