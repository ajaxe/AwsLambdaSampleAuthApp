<template>
    <div id="login" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-sm-8 col-xs-10">
            <div class="card">
                <form novalidate ref="registerForm">
                    <div class="card-body">
                        <h5 class="card-title">Register</h5>
                        <div class="form-group" >
                            <label label-for="reg-username">Username</label>
                            <input type="email" class="form-control" id="reg-username" v-model="username" placeholder="Enter email" required aria-required="true" aria-describedby="emailHelp emailError"/>
                            <div class="invalid-feedback" id="emailError">Well formed email is required as username.</div>
                            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>
                        <div class="form-group">
                            <label for="reg-password">Password</label>
                            <input class="form-control" type="password" id="reg-password" v-model="password" placeholder="Password" required aria-required="true" aria-describedby="passwordHelp passwordError" minlength="8"/>
                            <div class="invalid-feedback" id="passwordError">Password is required, should be minimum of 8 characters.</div>
                            <small id="passwordHelp" class="form-text text-muted">Minimum of 8 characters.</small>
                        </div>
                        <div class="form-group">
                            <label for="reg-confirmPassword">Confirm Password</label>
                            <input class="form-control" type="password" id="reg-confirmPassword" v-model="confirmPassword" placeholder="Re-Type Password" required aria-required="true" />
                            <div class="invalid-feedback">Password is required.</div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex">
                            <button class="btn btn-primary" type="submit" @click="register">Register</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Provide } from "vue-property-decorator";
import { Api, UserRegister } from './api';

@Component
export default class Register extends Vue {
  @Provide() username: string = '';
  @Provide() password: string = '';
  @Provide() confirmPassword: string = '';
  readonly api: Api = new Api();

  register(event: Event): void {
    let form = <HTMLFormElement>this.$refs.registerForm;
    if (form.checkValidity() === true) {
        this.api.registerUser({
            username: this.username,
            password: this.password,
            confirmPassword: this.confirmPassword
        })
        .then(function(){
            console.log('registered');
        },
        function(){
            console.log('rejected');
        });
    }
    form.classList.add("was-validated");
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>
