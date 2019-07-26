<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link v-if="userData" to="/dashboard">Dashboard</router-link>
      <router-link v-else to="/login">Login</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  data() {
    return {}
  },
  computed: {
    ...mapState({
      userData: state => state.userData
    }),
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 680px;
  margin: 0 auto;
  color: $darkGrey;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: $inactiveLink;
    &.router-link-exact-active {
      color: $activeLink;
    }
  }
}
</style>
