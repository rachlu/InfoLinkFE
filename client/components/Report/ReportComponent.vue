<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["objType", "objID"]);
const emit = defineEmits(["refreshPost"]);
const showToolTip = ref(false);

const confirm = async () => {
  try {
    await fetchy(`/api/${props.objType}/${props.objID}/report`, "POST");
  } catch {
    return;
  }
  emit("refreshPost");
};

const cancel = async () => {
  showToolTip.value = false;
};

const show = async () => {
  showToolTip.value = true;
};
</script>

<template>
  <div>
    <div @click="show" class="flag">🚩</div>
    <div class="popup" v-if="showToolTip">
      <p>Report?</p>
      <button @click="confirm">Confirm</button>
      <button @click="cancel">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.flag {
  cursor: pointer;
}

.popup {
  position: absolute;
  top: center;
  left: center;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 1000;
  border-radius: 4px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
