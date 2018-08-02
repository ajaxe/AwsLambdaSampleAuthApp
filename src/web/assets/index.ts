import Vue from "vue";
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.css';

Vue.config.productionTip = false;

let v = new Vue({
    el: '#app',
    render: h => h(App)
});