<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["type", "id"]);
const emit = defineEmits(["updateLikes"]);

const total = ref(0);
const liked = ref(false);

const toggleLike = async () => {
  // Already Liked
  if (liked.value) {
    // Unlike
    try {
      await fetchy(`/api/${props.type}/${props.id}/like`, "DELETE");
    } catch {
      return;
    }
    total.value -= 1;
  } else {
    // Like
    try {
      await fetchy(`/api/${props.type}/${props.id}/like`, "POST");
    } catch {
      return;
    }
    total.value += 1;
  }
  liked.value = !liked.value;
  emit("updateLikes", total.value);
};

const update = async () => {
  total.value = await fetchy(`/api/like/${props.id}`, "GET");
  if (total.value) {
    liked.value = true;
  } else {
    liked.value = false;
  }
  emit("updateLikes", total.value);
};

onBeforeMount(async () => {
  await update();
});

watch(
  () => props.id,
  async () => {
    await update();
  },
);
</script>

<template>
  <div>
    <button @click="toggleLike">
      <span v-if="liked">❤️</span>
      <span v-else>🤍</span>
    </button>
  </div>
</template>

<style scoped></style>
