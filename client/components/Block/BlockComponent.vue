<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["item", "objType"]);
const emit = defineEmits(["update"]);
const action = ref("");
const showPopup = ref(false);
const approve = async () => {
  console.log(props.item._id);
  try {
    await fetchy(`/api/${props.objType}/${props.item._id}/approve`, "DELETE");
  } catch {
    return;
  }
  emit("update");
};

const reject = async () => {
  try {
    await fetchy(`/api/${props.objType}/${props.item._id}/reject`, "DELETE");
  } catch {
    return;
  }
  emit("update");
};

const confirm = async () => {
  showPopup.value = false;
  if (action.value === "approve") {
    await approve();
  } else if (action.value === "reject") {
    await reject();
  }
};

const cancel = async () => {
  showPopup.value = false;
};

const showConfirmPopup = async (a: string) => {
  action.value = a;
  showPopup.value = true;
};
</script>

<template>
  <div>
    <p>{{ props.item.content }}</p>
    <button @click="showConfirmPopup('approve')">Check</button>
    <button @click="showConfirmPopup('reject')">X</button>

    <!-- Confirmation Popup -->
    <div v-if="showPopup" class="popup">
      <p>Are you sure you want to {{ action }}?</p>
      <button @click="confirm">Confirm</button>
      <button @click="cancel">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.like {
  display: flex;
  gap: 0.5em;
  justify-content: flex-end;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.fade-paragraph {
  overflow: hidden;
  position: relative;
}

.fade-paragraph p {
  margin: 0;
  padding: 0;
  position: relative;
  line-height: 1.5;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  max-height: 10em;
}
</style>
