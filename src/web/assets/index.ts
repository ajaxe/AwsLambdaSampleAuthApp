import Vue from "vue";
import App from './App.vue';
import VueRouter from 'vue-router';

import './app.scss';

Vue.config.productionTip = false;
Vue.use(VueRouter);

let v = new Vue({
    el: '#app',
    render: h => h(App)
});