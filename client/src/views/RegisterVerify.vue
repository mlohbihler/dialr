<!-- Copyright Serotonin Software 2019 -->
<template>
  <div id="register-verify">
    <div v-if="error" class="error-message">{{ error }}</div>
    <p v-else>
      One sec, I'm verifying your token thingy...
    </p>
  </div>
</template>

<script>
import { post } from '@/api'

export default {
  name: 'RegisterVerify',
  data() {
    return {
      error: null
    }
  },
  async mounted() {
    const result = await post('/user/activate-registration', {
      token: this.$route.params.token
    })

    if (result.error) {
      if (result.error.code === 'user-activateRegistration-4') {
        this.error = `A pending activation was not found for the given token. You might have already used the token
                     (i.e. you're already registered). Or, you might need to register again.`
      } else {
        this.error = result.error.message
      }
    } else {
      // Success. Redirect to the login page.
      this.$router.push({ name: 'login', params: { verified: result.email } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#register-verify {
  .error-message {
    margin-bottom: 20px;
  }
}
</style>
