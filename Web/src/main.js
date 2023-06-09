import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import AppRecharge from './components/AppRecharge.vue'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.css'

const vuetify = createVuetify({
  components,
  directives,
})

// 创建 Vue Router 实例
const router = createRouter({
  history: createWebHistory(),
  // 配置路由规则
  routes: [
    // 定义路由
    {
      path: '/',
      component: App, // 在此处指定组件名，例如 Home 是一个组件
    },
    {
      path: '/recharge',
      component: AppRecharge, // 在此处指定组件名，例如 About 是一个组件
    },
  ],
});

// 创建 Vue 应用实例
const app = createApp(App);

// 提供 router 实例
app.provide('$router', router); 

// 使用 Vue Router
app.use(router);

// 使用 Vuetify
app.use(vuetify);

// 将应用挂载到 DOM
app.mount('#app');
