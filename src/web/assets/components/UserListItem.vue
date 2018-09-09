<template>
    <div>
        <div class="header row">
            <div class="col">
                <i class="fas fa-angle-right" :class="[isOpen ? 'fa-angle-down' : 'fa-angle-right']"></i>
                <strong>{{user.username}}</strong>
            </div>
        </div>
        <div v-for="t in tokens" :key="t.tokenId" class="token-info container">
            <div class="row">
                <div class="col col-md-2">
                    <div class="row">
                        <div :class="col1Css"><label>Token Id</label></div>
                        <div :class="col2Css">{{t.tokenId}}</div>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <div :class="col1Css"><label>Created</label></div>
                        <div :class="col2Css">{{t.created | formatDate}}</div>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <div :class="col1Css"><label>Expiration</label></div>
                        <div :class="col2Css">{{t.expire | formatDate}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.header {
  padding: 10px 0;

  strong {
    margin-left: 10px;
  }
}
.token-info {
  margin-left: 20px;

  label {
      font-weight: bold;
  }
}
</style>

<script lang="ts">
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import { Api } from "./api";
import { User } from "../../../api/types/user";
import { AuthToken } from "../../../api/types/authToken";

@Component
export default class UserListItem extends Vue {
  @Prop() user: User;
  @Provide() isOpen: boolean = false;
  get tokens(): AuthToken[] {
    return this.user.tokens || [];
  }
  get col1Css() {
    return "col-sm-12";
  }
  get col2Css() {
    return "col-sm-12";
  }
}
</script>