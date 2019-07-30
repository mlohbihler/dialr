<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <p v-if="verified" class="success-message">
      <strong>Nice! Your email address was verified, and you're all set. Go ahead and log in.</strong>
    </p>
    <p v-else-if="resetPassword" class="success-message">
      <strong>Yeah! Your password reset was successful. Go ahead and log in with your shiny new password.</strong>
    </p>
    <p v-else-if="loggedOut" class="success-message">
      <strong>You have been logged out.</strong>
    </p>
    <form @submit.prevent="trySubmit" novalidate>
      <FormText label="Email" required type="email" placeholder="Email" v-model="email" autoFocus/>
      <FormText label="Password" required type="password" placeholder="Password" v-model="password"/>
      <div v-if="error" class="error-message">{{ error }}</div>
      <FormButton :loading="inProgress">Login</FormButton>
    </form>
    <div class="links">
      <div><router-link :to="{ name: 'forgotPassword' }">Forgot your password?</router-link></div>
      <div><router-link :to="{ name: 'resendVerification', params: { email: email } }"
          v-if="showVerificationResendLink">Resend address verification email</router-link></div>
      <div>
        <strong>No account?</strong>&nbsp;
        <router-link :to="{ name: 'register' }">Create one.</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'

import { post } from '@/api'
// import { localUrl } from '@/util'
import { mapMutations } from 'vuex'

export default {
  components: { FormButton, FormText },
  data() {
    return {
      verified: false,
      resetPassword: false,
      email: '',
      password: '',
      inProgress: false,
      error: null,
      notVerified: false,
      showVerificationResendLink: false,
      loggedOut: false
    }
  },
  beforeMount() {
    const verified = this.$route.params.verified
    if (verified) {
      this.verified = true
      this.email = verified
    } else if (this.$route.params.resetPassword) {
      this.resetPassword = true
      this.email = this.$route.params.resetPassword
    } else if (this.$route.params.status === 'loggedOut') {
      this.loggedOut = true
    }
  },
  methods: {
    ...mapMutations(['setUserData']),
    async trySubmit() {
      this.inProgress = true

      const result = await post('/session', {
        email: this.email,
        password: this.password
      })

      this.inProgress = false

      this.error = null
      this.notVerified = false
      if (result.error) {
        if (result.error.code === 'session-login-1') {
          this.error = 'Please enter your email address'
        } else if (result.error.code === 'session-login-2') {
          this.error = 'Please enter your password'
        } else if (result.error.code === 'session-login-3') {
          this.error = 'Your account was not found'
        } else if (result.error.code === 'session-login-4') {
          this.error = 'Your email address has not yet been verified. Use the link belows to resend your verification email'
          this.showVerificationResendLink = true
        } else if (result.error.code === 'session-login-5') {
          this.error = 'Your account has been deactivated'
        } else {
          this.error = result.error.message
        }
      } else {
        // Update the user data with the response.
        this.setUserData(result.user)
        this.$router.push({ name: 'dashboard' })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.error-message {
  margin-bottom: 20px;
}

.links {
  margin-bottom: 20px;
}
</style>
