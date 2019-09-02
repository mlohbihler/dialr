<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <p>One sec, logging you out...</p>
  </div>
</template>

<script>
import { dele } from '@/api'
import { gapi } from '@/util'

export default {
  async mounted() {
    const logoutPromise = dele('/session')
    const auth = gapi().auth2.getAuthInstance()
    const signoutPromise = (auth && auth.signOut()) || Promise.resolve()

    await Promise.all([logoutPromise, signoutPromise])

    this.$store.commit('setUserData', null)
    this.$router.push({ name: 'login', params: { status: 'loggedOut' } })
  }
}
</script>

<style lang="sass" scoped>
</style>
