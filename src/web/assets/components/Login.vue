<template>
    <div id="login" class="row justify-content-center">
        <div class="col-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Login</h5>
                    <form novalidate>
                        <div class="form-group">
                            <label for="username">Email address</label>
                            <input type="email" class="form-control" id="username" aria-describedby="emailHelp" placeholder="Enter email" required aria-required="true">
                            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" placeholder="Password" required aria-required="true">
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-primary">Submit</button>
                        <div class="align-self-center">
                            <a href="#">Register</a>
                        </div>
                    </div>
                </div>
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
import { Vue, Component, Prop, Provide } from "vue-property-decorator";

@Component
export default class Login extends Vue {}
</script>

