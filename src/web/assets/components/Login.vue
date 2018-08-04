<template>
    <div id="login" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-sm-8 col-xs-10">
            <div class="card">
                <form novalidate ref="loginForm">
                    <div class="card-body">
                        <h5 class="card-title">Login</h5>
                        <div class="form-group"  description="We'll never share your email with anyone else.">
                            <label label-for="username">Username</label>
                            <input type="email" class="form-control" id="username" v-model="username" placeholder="Enter email" required aria-required="true" aria-describedby="emailHelp passwordEmailError"/>
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

@Component
export default class Login extends Vue {
  @Provide() username: string = '';
  @Provide() password: string = '';
  @Provide() formValidated: boolean = false;

  login(event: Event): void {
    let form  = <HTMLFormElement>this.$refs.loginForm;
    console.log(typeof form);
    if(form.checkValidity() === false) {

    }
    form.classList.add('was-validated');
    this.formValidated = true;
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

