<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      &nbsp;&nbsp;
      <router-link to="/login">Login</router-link>
      &nbsp;&nbsp;
      <router-link to="/users">Create Account</router-link>
    </nav>
    <router-view /> <!-- displays the current route's component -->
  </div>
</template>


<script>
  import Login from './pages/Login.vue';
  import CreateAccount from './pages/CreateAccount.vue';

export default {
  data() {
    return {
      welcome_message: "Hello World!",
      counter: 0
    };
  },
  methods: {
    increment() {
      this.counter++;
    }
  },
  components: {
    Login,
    CreateAccount
  }
};
</script>
