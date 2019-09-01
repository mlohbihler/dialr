<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <div v-if="success">
      Cool. We sent a message message to the email address you provided. Please follow the
      instructions in it.
    </div>
    <div v-else>
      <p>
        To reset your password, first submit your registered email address below. We will then send
        you an email with a link to follow where you can provide a new password.
      </p>
      <form @submit.prevent="trySubmit" novalidate>
        <FormText label="Email" type="email" placeholder="Your email address" v-model="email" required :errorMsg="error"/>
        <FormButton :loading="inProgress">Request Password Reset</FormButton>
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
  methods: {
    async trySubmit() {
      this.inProgress = true

      const result = await post('/user/request-password-reset', {
        email: this.email,
        url: localUrl('/reset-password/{token}')
      })

      this.inProgress = false

      if (result.error) {
        if (result.error.code === 'user-requestPasswordReset-1') {
          this.error = 'Enter a valid email address'
        } else if (result.error.code === 'user-requestPasswordReset-3') {
          this.error = 'That email address was not found'
        } else if (result.error.code === 'user-requestPasswordReset-4') {
          this.error = 'Hmm, there was a problem sending the email'
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
</style>
