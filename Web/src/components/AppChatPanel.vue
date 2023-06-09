<template>
  <v-container v-if="showComponent" class="chat-panel">
    <v-container class="output-container">
      <v-card>
        <v-card-text class="output">
          {{ outputText }}
        </v-card-text>
      </v-card>
    </v-container>
    <v-container fluid class="floating-textarea">
      <v-textarea
        counter
        clearable
        elevation-6
        clear-icon="mdi-close-circle"
        :append-inner-icon="inputValue ? 'mdi-send' : 'mdi-send-lock'"
        rows="4"
        row-height="5"
        label="Input your text."
        :rules="rules"
        :model-value="inputValue"
        v-char-counter
        @keydown.enter="submitData"
        @click:append-inner="submitData"
        @input="updateInputValue"
      ></v-textarea>
    </v-container>
  </v-container>
</template>

<script>
import { defineComponent, ref, inject } from 'vue';
import axios from "axios";

export default defineComponent({
  directives: {
    charCounter: {
      mounted(el) {
        const textarea = el.querySelector("textarea");
        const counter = el.querySelector(".v-counter");

        textarea.addEventListener("input", () => {
          const charCount = textarea.value.length;
          counter.textContent = charCount;
        });
      },
    },
  },
  setup() {
    const outputText = ref("");
    const additionalData = ref("");
    const rules = ref([(v) => v.length <= 5000 || "最多输入5000个字符"]);
    const inputValue = ref("");
    const showComponent = ref(true);

    const updateInputValue = (event) => {
      inputValue.value = event.target.value;
    };

    const submitData = async () => {
      if (inputValue.value) {
        const requestData = {
          url: "/antiai/api/data", // Replace with your API endpoint
          text: inputValue.value,
        };

        try {
          const response = await axios.post(requestData.url, requestData);
          outputText.value = response.data.content;
          additionalData.value = response.data.additionalData;
        } catch (error) {
          console.error(error);
        }
        inputValue.value = "";
      }
    };

    const router = inject("$router"); // 注入 $router

    router.beforeEach((to, from, next) => {
      if (to.path !== "/") {
        outputText.value = "";
        additionalData.value = "";
        inputValue.value = "";
        showComponent.value = false; // 隐藏组件
      } else {
        showComponent.value = true; // 显示组件
      }
      next();
    });

    return {
      outputText,
      additionalData,
      submitData,
      rules,
      inputValue,
      updateInputValue,
      showComponent
    };
  },
});
</script>

<style>
.chat-panel {
  position: flex;
  min-height: 100vh;
}

.output-container {
  width: calc(90% - 10%);
  max-width: 400px;
  height: 70vh;
}

.output {
  width: calc(90% - 10%);
  max-width: 400px;
  height: 65vh;
}

.floating-textarea {
  height: 20vh;
  width: calc(90% - 10%);
  max-width: 400px;
  z-index: 999;
}

@media (max-width: 600px) {
  .floating-textarea {
    right: 10px;
    width: calc(100% - 20px);
  }
}
</style>
