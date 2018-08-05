<template>
    <div id="app">
        <nav class="navbar navbar-dark bg-dark">
            <div class="container align-self-start">
                <span class="navbar-brand mb-0 h1">{{appName}}</span>
            </div>
        </nav>
        <div class="filler navbar-dark bg-dark"></div>
        <div class="container main-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin-top: 10vh;
}
.filler {
  height: calc(30vh - 60px);
  margin-top: -1px;
  position: absolute;
  width: 100%;
  z-index: -1;
}
</style>


<script lang="ts">
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import VueRouter, { RouteConfig } from "vue-router";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import { RouteNames } from "./routes";

const routes: RouteConfig[] = [
  { path: "/register", component: Register, name: RouteNames.Register },
  { path: "/login", component: Login, name: RouteNames.Login },
  { path: "/", redirect: "/login", name: RouteNames.Home }
];

const AppRouter = new VueRouter({
  routes // short for `routes: routes`
});

@Component({
  components: {
    Login,
    Register
  },
  router: AppRouter
})
export default class App extends Vue {
  @Provide() appName: string = "AWS Sample Lambda Web App";
}
</script>

