<template>
    <div id="login" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-sm-8 col-xs-10">
            <div class="card">
                <form novalidate ref="loginForm">
                    <div class="card-body">
                        <h5 class="card-title">Login</h5>
                        <div class="form-group" description="We'll never share your email with anyone else.">
                            <label label-for="username">Username</label>
                            <input type="email" class="form-control" id="username" v-model="username" placeholder="Enter email" required aria-required="true" aria-describedby="emailHelp passwordEmailError" />
                            <div class="invalid-feedback" id="passwordEmailError">Well formed email is required as username.</div>
                            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input class="form-control" type="password" id="password" v-model="password" placeholder="Password" required aria-required="true" />
                            <div class="invalid-feedback">Password is requied.</div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex">
                            <button class="btn btn-primary" type="submit" @click="login">Submit</button>
                            <div class="align-self-center" style="margin-left: 10px;">
                                <router-link to="/register">Register</router-link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card-footer {
  background-color: transparent;
}
</style>


<script lang="ts">
import { Vue, Component, Provide } from "vue-property-decorator";
import { LoginData } from "./types/loginData";
import { Api } from "./api";
import { RouteNames } from "../routes";

@Component({
    mounted: function() {
        console.log('login-mounted');
        this.$eventBus.$emit('login-mounted');
    }
})
export default class Login extends Vue {
  @Provide() username: string = "";
  @Provide() password: string = "";
  @Provide() formValidated: boolean = false;
  readonly api: Api = new Api();

  login(event: Event): void {
    let self = this;
    let form = <HTMLFormElement>self.$refs.loginForm;
    console.log(typeof form);
    let data: LoginData = Object.assign(new LoginData(), {
      username: self.username,
      password: self.password
    });
    let result = data.validate();
    if (form.checkValidity() === true && result.isValid()) {
      self.api
        .login(data)
        .then(function(message) {
            let random = 200 + (Math.random() * 200) % 200;
            setTimeout(function(){
                console.log('Timeout before push: ' + random);
                self.$router.push({ name: RouteNames.Home });
            }, random);
        })
        .catch(function(message) {
          alert(message);
        });
    }
    form.classList.add("was-validated");
    this.formValidated = true;
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

