<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <p v-if="success">
      Your address verification email has been resent. Check your inbox.
    </p>
    <div v-else>
      <p>Enter your email address below and we will resend you an address verification email.</p>
      <form @submit.prevent="trySubmit" novalidate>
        <FormText label="Email" required type="email" placeholder="Email" v-model="email" autoFocus/>
        <div v-if="error" class="error-message">{{ error }}</div>
        <FormButton :loading="inProgress">Resend verification email</FormButton>
      </form>
    </div>
  </div>
</template>

<script>
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'

import { post } from '@/api'
import { localUrl } from '@/util'

export default {
  components: { FormButton, FormText },
  data() {
    return {
      email: '',
      error: null,
      inProgress: false,
      success: false
    }
  },
  beforeMount() {
    if (this.$route.params.email) {
      // A redirect from the login page
      this.email = this.$route.params.email
    }
  },
  methods: {
    async trySubmit() {
      this.inProgress = true

      const result = await post('/user/resend-verification-email', {
        email: this.email,
        url: localUrl('/register/verify-email/{token}')
      })

      this.inProgress = false
      this.error = null

      if (result.error) {
        if (result.error.code === 'user-resendVerificationEmail-1') {
          this.error = 'Your email address is invalid'
        } else if (result.error.code === 'user-resendVerificationEmail-3') {
          this.error = 'The pending email verification was not found. The address may already be verified, or you may need to register again.'
        } else if (result.error.code === 'user-resendVerificationEmail-4') {
          this.error = 'Hmm, there was a problem sending the email.'
        } else {
          this.error = result.error.message
        }
      } else {
        this.success = true
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
</style>
