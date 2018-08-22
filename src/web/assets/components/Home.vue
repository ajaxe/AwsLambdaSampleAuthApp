<template>
    <div class="home-root container-fluid">
        <h2>User Sessions <span class="badge smaller badge-pill badge-secondary">Current Session: <span v-text="sessionId"></span></span></h2>
        <div class="row">
            <div class="col-sm-6 col-md-8  order-2 order-md-1">
                <user-list></user-list>
            </div>
            <div class="col-sm-6 col-md-4 order-1 order-md-2">
                <div class="alert alert-info" role="alert">
                    <h5 class="card-title">Info card title</h5>
                    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.badge.smaller {
    font-size: 60%;
    vertical-align: top;
}
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
import { Route, RawLocation } from "vue-router";
import { Api } from "./api";
import { RouteNames } from "../routes";
import UserList from './UserList.vue';

@Component({
  beforeRouteEnter: (
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void
  ) => {
    let api: Api = new Api();
    api
      .checkUserSession()
      .then(function(isValid) {
        isValid ? next() : next({ name: RouteNames.Login });
      })
      .catch(function() {
        next({ name: RouteNames.Login });
      });
  },
  mounted: function() {
    console.log("home-mounted");
    console.log(this);
    this.$eventBus.$emit("home-mounted");
  },
  components: { UserList }
})
export default class Home extends Vue {
    @Provide() sessionId: string;
    readonly api: Api = new Api();

    constructor() {
        super();
        this.sessionId = this.api.getCurrentSessionId() || 'Not Available';
    }
}
</script>

