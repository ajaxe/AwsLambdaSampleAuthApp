<template>
  <div id="user-list">
    <button @click="getMore()"> Get More</button>
    <p v-if="isLoading">Loading data</p>
    <ul>
      <li v-for="(index, u) in users" :key="u">
        {{index}} - {{u}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Provide } from "vue-property-decorator";
import { Api } from "./api";

@Component({
  mounted: function() {
    let userListVue = <UserList>this;
    userListVue.loadUsers();
  }
})
export default class UserList extends Vue {
  @Provide() users: string[] = [];
  @Provide() isLoading: boolean = true;

  readonly api: Api = new Api();

  constructor() {
    super();
  }

  loadUsers() {
    let self = this;
    setTimeout(function() {
      self.$nextTick(function() {
        Array.prototype.push.apply(self.users, ["a", "b", "c"]);
        console.log("users updated");
        self.isLoading = false;
      });
    }, 3000);
  }
}
</script>

