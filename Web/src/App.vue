<template>
  <div class="app">
    <div class="left">
      <AppSidebar />
    </div>
    <div class="right">
      <AppChatPanel />
    </div>
  </div>
</template>

<script>
import AppSidebar from "./components/AppSidebar.vue";
import AppChatPanel from "./components/AppChatPanel.vue";

export default {
  components: {
    AppSidebar,
    AppChatPanel,
  },
};
</script>

<style>
.app {
  display: flex;
  flex: 1;
}

.left {
  flex: 1.5;
}

.right {
  flex: 8.5;
}
</style>
