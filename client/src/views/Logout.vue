<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <p>One sec, logging you out...</p>
  </div>
</template>

<script>
import { dele } from '@/api'

export default {
  async mounted() {
    await dele('/session')
    this.$store.commit('setUserData', null)
    this.$router.push({ name: 'login', params: { status: 'loggedOut' } })
  }
}
</script>

<style lang="sass" scoped>
</style>
