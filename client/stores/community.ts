import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useCommunityStore = defineStore(
  "community",
  () => {
    // const communityIDs = ref<Array<Record<string, string>>>([]);
    const communityIDs = ref<Array<string>>([]);

    const updateCommunityPosts = async () => {
      let communityResults;
      try {
        communityResults = await fetchy("/api/edits", "GET");
        communityIDs.value = communityResults;
      } catch (_) {
        communityIDs.value = [];
      }
    };

    return {
      communityIDs,
      updateCommunityPosts,
    };
  },
  { persist: true },
);
