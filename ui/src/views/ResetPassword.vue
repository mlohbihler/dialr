<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <p>
      Enter your new password, and remember it this time. :) Just kidding, you can change it any
      time you want.
    </p>
    <form @submit.prevent="trySubmit" novalidate>
      <FormText label="Password" required type="password" placeholder="Password" v-model="password" :errorMsg="error"
          hint="Your password must be at least 10 characters, and contain lower and upper case, numbers and symbols"/>
      <FormButton :loading="inProgress">Change password</FormButton>
    </form>
  </div>
</template>

<script>
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'

import { post } from '@/api'

export default {
  components: { FormButton, FormText },
  data() {
    return {
      password: '',
      error: null,
      inProgress: false
    }
  },
  methods: {
    async trySubmit() {
      this.inProgress = true

      const result = await post('/user/reset-password', {
        password: this.password,
        token: this.$route.params.token
      })

      this.inProgress = false
      this.error = null

      if (result.error) {
        if (result.error.code === 'user-resetPassword-2') {
          this.error = result.error.message
        } else if (result.error.code === 'register-resetPassword-3') {
          this.error = 'Your token is not valid. It may have expired, or already have been used. You should start the password reset process again.'
        } else {
          this.error = result.error.message
        }
      } else {
        // Redirect to login
        this.$router.push({ name: 'login', params: { resetPassword: result.email } })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
