<template>
    <div class="home-root">
        <h2>Home</h2>
    </div>
</template>

<style lang="scss" scoped>
.home-root {
    background-color: white;
    border-radius: 5px;
    min-height: 200px;

    > h2 {
        padding-left: 10px;
        padding-top: 10px;
    }
}
</style>


<script lang="ts">
import { Vue, Component, Provide } from "vue-property-decorator";
import { Route, RawLocation } from 'vue-router';
import { Api } from './api';
import { RouteNames } from '../routes';

@Component({
    beforeRouteEnter: (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) => {
        let api: Api = new Api();
        api.checkUserSession()
        .then(function(isValid){
            isValid ? next() : next({ name: RouteNames.Login });
        })
        .catch(function(){
            next({ name: RouteNames.Login });
        });
    },
    mounted: function() {
        console.log('home-mounted');
        this.$eventBus.$emit('home-mounted');
    }
})
export default class Home extends Vue {

}
</script>

