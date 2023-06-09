<template>
  <v-container class="sidebar">
  <v-card>
    <v-layout>
      <v-navigation-drawer
        image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
        permanent
        theme="dark"
      >
        <template v-slot:prepend>
          <v-list nav>
            <v-list-item @click="navigateTo('')" prepend-icon="mdi-email" title="应用中心"></v-list-item>
            <v-list-item @click="navigateTo('recharge')" prepend-icon="mdi-account-supervisor-circle" title="充值中心"></v-list-item>
            <v-list-item @click="navigateTo('help')" prepend-icon="mdi-clock-start" title="帮助"></v-list-item>
          </v-list>
        </template>
      </v-navigation-drawer>
      <v-main></v-main>
    </v-layout>
  </v-card>
</v-container>
</template>

<script>
export default {
  mounted() {
    this.$router = this.$router || this.$parent.$router;
  },
  methods: {
    navigateTo(page) {
      this.$router.push({ path: '/' + page });
    }
  }
};
</script>

<style scoped>
.v-navigation-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
