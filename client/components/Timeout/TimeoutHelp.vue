<script setup lang="ts">
import { ref } from "vue";

const showToolTip = ref(false);

const print = async () => {
  showToolTip.value = !showToolTip.value;
  console.log(showToolTip.value);
};
</script>

<template>
  <div class="tooltip-container">
    <span @mouseenter="print" @mouseleave="print" class="question-mark">?</span>
    <div v-if="showToolTip" class="tooltip">This is a community tagged post where all users can collaborate to create a common post!</div>
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
  left: 0;
  background-color: #333;
  color: #fff;
  padding: 0.1em;
  border-radius: 0.4em;
  margin-left: 1em;
  width: 10em;
  display: none;
}

.tooltip-container:hover .tooltip {
  display: block;
}
</style>
