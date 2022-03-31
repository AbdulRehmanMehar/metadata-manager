'use strict'

import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from "@fortawesome/fontawesome-svg-core";
import { dom } from "@fortawesome/fontawesome-svg-core";
dom.watch();
library.add(fas, fab);


const app = createApp(App)
  .use(store);

app.component("font-awesome-icon", FontAwesomeIcon);
app.mount('#app');
