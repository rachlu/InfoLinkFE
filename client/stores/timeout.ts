import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";

export const useTimeoutStore = defineStore(
  "timeout",
  () => {
    const timeoutUsers = ref<Array<ObjectId>>([]);

    const updateTimeoutUsers = async () => {
      let timeoutUsersResults;
      try {
        timeoutUsersResults = await fetchy("/api/timeout", "GET");
        timeoutUsers.value = timeoutUsersResults;
      } catch (_) {
        timeoutUsers.value = [];
      }
    };

    const getExpireDate = async (userID: ObjectId) => {
      return await fetchy(`/api/timeout/${userID}`, "GET");
    };

    setInterval(async () => await updateTimeoutUsers(), 6000);

    return {
      timeoutUsers,
      updateTimeoutUsers,
      getExpireDate,
    };
  },
  { persist: true },
);
