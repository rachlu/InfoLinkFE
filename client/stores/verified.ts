import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useVerifyStore = defineStore(
  "verify",
  () => {
    const verifiedTags = ref<Array<string>>([]);

    const updateVerifiedTags = async () => {
      let verifyResults;
      try {
        verifyResults = await fetchy("/api/tags/verify", "GET");
        verifiedTags.value = verifyResults;
      } catch (_) {
        verifiedTags.value = [];
      }
    };

    setInterval(async () => await updateVerifiedTags(), 6000);

    return {
      verifiedTags,
      updateVerifiedTags,
    };
  },
  { persist: true },
);
