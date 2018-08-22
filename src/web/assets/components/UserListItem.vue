<template>
    <div>
        <div>{{user.username}}</div>
        <div v-for="t in tokens" :key="t.userId">
            <span >tokenId: {{t.tokenId}}</span>
            <span >created: {{t.created}}</span>
            <span >expire: {{t.expire}}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import { Api } from "./api";
import { User } from '../../../api/types/user';
import { AuthToken } from '../../../api/types/authToken';

@Component
export default class UserListItem extends Vue {
  @Prop() user: User;
  @Provide() tokens(): AuthToken[] {
      return this.user.tokens || [];
  }

}
</script>