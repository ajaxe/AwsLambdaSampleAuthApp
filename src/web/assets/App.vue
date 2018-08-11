<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark">
      <div class="container justify-content-between">
        <div class="navbar-brand mb-0 h1">{{appName}}</div>
        <div class="navbar-nav" v-if="showSignout">
          <a href="#" class="btn btn-outline-light" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span class="d-none d-sm-inline">Signout</span>
          </a>
        </div>
      </div>
    </nav>
    <div class="filler navbar-dark bg-dark"></div>
    <div class="container main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar-brand {
  max-width: 60vw;
  white-space: pre-wrap;
}
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
import VueRouter, {
  RouteConfig,
  RawLocation,
  Route,
  NavigationGuard
} from "vue-router";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import Home from "./components/Home.vue";
import { RouteNames } from "./routes";
import { Api } from "./components/api";

const routes: RouteConfig[] = [
  { path: "/register", component: Register, name: RouteNames.Register },
  { path: "/login", component: Login, name: RouteNames.Login },
  { path: "/home", component: Home, name: RouteNames.Home },
  { path: "/", redirect: "/home" }
];

const AppRouter = new VueRouter({
  routes // short for `routes: routes`
});

Vue.prototype.$eventBus = new Vue({});

@Component({
  components: {
    Login,
    Register
  },
  router: AppRouter
})
export default class App extends Vue {
  @Provide() appName: string = "AWS Sample Lambda Web App";
  @Provide() showSignout: boolean = false;

  readonly api: Api = new Api();
  basePush: Function;

  constructor() {
    super();
    let self = this;
    self.$eventBus.$on("home-mounted", function() {
      self.toggleSignout(true);
      console.log("root home-mounted");
    });
    self.$eventBus.$on("login-mounted", function() {
      self.toggleSignout(false);
      console.log("root login-mounted");
    });
  }

  toggleSignout(show: boolean) {
    this.showSignout = show;
    console.log("root logged in");
  }
  logout(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    let self = this;
    self.api.logout().finally(function() {
      self.$nextTick(function() {
        self.showSignout = false;
      });
      self.$router.push({ name: RouteNames.Login });
    });
  }
}
</script>

