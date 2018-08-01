<template>
    <div id="login" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-sm-8 col-xs-10">
            <div class="card">
                <b-form novalidate ref="loginForm" @submit="login" :validated="formValidated">
                    <div class="card-body">
                        <h5 class="card-title">Login</h5>
                        <b-form-group label-for="username" label="Username" description="We'll never share your email with anyone else.">
                            <b-form-input type="email" id="username" v-model="username" placeholder="Enter email" required aria-required="true" />
                            <b-form-invalid-feedback>Well formed email is required as username.</b-form-invalid-feedback>
                        </b-form-group>
                        <b-form-group label-for="password" label="Password">
                            <b-form-input type="password" id="password" v-model="password" placeholder="Password" required aria-required="true" />
                            <b-form-invalid-feedback>Password is requied.</b-form-invalid-feedback>
                        </b-form-group>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex">
                            <b-button variant="primary" type="submit">Submit</b-button>
                            <div class="align-self-center" style="margin-left: 10px;">
                                <a href="#">Register</a>
                            </div>
                        </div>
                    </div>
                </b-form>
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
import { Form } from "bootstrap-vue";

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
    this.formValidated = true;
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

