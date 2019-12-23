import '@mdi/font/css/materialdesignicons.css';
import 'animate.css';
import 'vuetify/dist/vuetify.min.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import '@/assets/styles/_mixins.scss';
import '@/assets/styles/base.scss';
import '@/assets/styles/layout.scss';
import '@/assets/styles/overrides.scss';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
