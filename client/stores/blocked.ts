import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useBlockStore = defineStore(
  "block",
  () => {
    // const communityIDs = ref<Array<Record<string, string>>>([]);
    const blockedPosts = ref<Array<string>>([]);
    const blockedEdits = ref<Array<string>>([]);

    const updateBlockedPosts = async () => {
      let blockResults;
      try {
        blockResults = await fetchy("/api/posts/block", "GET");
        blockedPosts.value = blockResults;
      } catch (_) {
        blockedPosts.value = [];
      }
    };

    const updateBlockedEdits = async () => {
      let blockResults;
      try {
        blockResults = await fetchy("/api/edits/block", "GET");
        blockedEdits.value = blockResults;
      } catch (_) {
        blockedEdits.value = [];
      }
    };

    return {
      blockedPosts,
      blockedEdits,
      updateBlockedPosts,
      updateBlockedEdits,
    };
  },
  { persist: true },
);
