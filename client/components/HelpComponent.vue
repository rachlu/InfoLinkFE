<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["msg"]);
const showToolTip = ref(false);

const toggle = async () => {
  showToolTip.value = !showToolTip.value;
};
</script>

<template>
  <div class="tooltip-container">
    <span @mouseenter="toggle" @mouseleave="toggle" class="question-mark">?</span>
    <div v-if="showToolTip" class="tooltip">{{ props.msg }}</div>
  </div>
</template>

<style>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.question-mark {
  cursor: pointer;
  background-color: lightcoral;
  border-radius: 50%;
  color: white;
  font-size: 1.2em;
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #333;
  color: #fff;
  padding: 0.1em;
  border-radius: 0.4em;
  margin-right: 1em;
  width: 10em;
  display: none;
}

.tooltip-container:hover .tooltip {
  display: block;
}
</style>
