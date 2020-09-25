import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import _ from "lodash";

Object.defineProperty(Vue.prototype, "_", { value: _ });

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
