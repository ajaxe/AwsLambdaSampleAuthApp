import Vue from "vue";
import App from './App.vue';
import VueRouter from 'vue-router';
import moment from 'moment'

import './styles';

Vue.config.productionTip = false;
Vue.use(VueRouter);

Vue.filter('formatDate', function (value: any) {
    if (value) {
        return moment(value).format('MM/DD/YYYY hh:mm:ss A')
    }
    return value;
});

let v = new Vue({
    el: '#app',
    render: h => h(App)
});