<template>
  <div id="user-list">
    <button @click="getMore()"> Get More</button>
    <p v-if="isLoading">Loading data</p>
    <user-list-item v-for="(u, key) in users" :key="key" v-bind:user="u">
    </user-list-item>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Provide } from "vue-property-decorator";
import { Api } from "./api";
import { User } from '../../../api/types/user';
import UserListItem from './UserListItem.vue';

@Component({
  mounted: function() {
    let userListVue = <UserList>this;
    userListVue.loadUsers();
  },
  components: { UserListItem }
})
export default class UserList extends Vue {
  @Provide() users: User[] = [];
  @Provide() isLoading: boolean = true;

  readonly api: Api = new Api();

  loadUsers() {
    let self = this;
    self.api.getUsers()
    .then(function(users){
      self.users = users;
      self.isLoading = false;
    })
    .catch(function(message){
      alert(message);
    });
  }
}
</script>

