/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApp } from "vue";
import App from "./App.vue";
import { initializeStore } from "./store";
import "./index.css";

// Initialize the store from localStorage
initializeStore();

// Create and mount the Vue application
const app = createApp(App);
app.mount("#root");
