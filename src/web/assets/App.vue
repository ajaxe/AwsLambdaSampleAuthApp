<template>
    <div id="app">
        <nav class="navbar navbar-dark bg-dark">
            <div class="container align-self-start">
                <span class="navbar-brand mb-0 h1">{{appName}}</span>
            </div>
        </nav>
        <div class="container main-container">
            <login />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.main-container {
    margin-top: -100px;
}
nav {
    height: 200px;
}
</style>


<script lang="ts">
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import Login from './components/Login.vue';

@Component({
    components: {
        Login
    }
})
export default class App extends Vue {
  @Provide() appName: string = "AWS Sample Lambda Web App";

  sayHiBack(): void {
    console.log("hi");
  }
}
</script>

