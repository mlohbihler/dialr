<!-- Copyright Serotonin Software 2019 -->
<template>
  <div id="register">
    <div v-if="emailSent">
      <p>
        Nice! Your registration was successful. Now go click the link in the email we just sent you, and we'll be good to go.
      </p>
    </div>
    <div v-else>
      <p>
        We're going to do the usual here. You enter an email address and password. We'll send you an email with a link in it. 
        You click on the link to verify your address and log in. We all smile.
      </p>
      <form @submit.prevent="tryRegister" novalidate>
        <FormText label="Email" required type="email" placeholder="Email" v-model="email" :errorMsg="emailError" autoFocus
            hint="We will only contact you about super emergencies or things that are way past cool, and never give your address to anyone."/>
        <FormText label="Password" required type="password" placeholder="Password" v-model="password" :errorMsg="passwordError"
            hint="Your password must be at least 10 characters, and contain lower and upper case, numbers and symbols"/>
        <div v-if="error" class="error-message">{{ error }}</div>
        <FormButton :disabled="inProgress" :loading="inProgress">Register</FormButton>
      </form>
    </div>
  </div>
</template>

<script>
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'

import { post } from '@/api'
import { localUrl } from '@/util'
import { typeFromAST } from 'graphql';

export default {
  name: 'Login',
  components: { FormButton, FormText },
  data() {
    return {
      email: '',
      password: '',
      inProgress: false,
      error: null,
      emailError: null,
      passwordError: null,
      emailSent: false
    }
  },
  methods: {
    async tryRegister() {
      this.inProgress = true

      const result = await post('/user', {
        email: this.email,
        password: this.password,
        url: localUrl('/register-verify/{token}')
      })

      this.inProgress = false

      this.error = null
      this.emailError = null
      this.passwordError = null
      this.notVerified = false
      if (result.error) {
        if (result.error.code === 'user-register-1') {
          this.error = 'Your email address is invalid'
          // this.emailError = 'Your email address is invalid'
        } else if (result.error.code === 'user-register-4') {
          this.error = result.error.message
          // this.passwordError = result.error.message
        } else if (result.error.code === 'user-register-5') {
          this.emailError = 'This address has already been registered'
        } else if (result.error.code === 'user-register-6') {
          this.error = 'Hmm, there was a problem sending your registration email'
        } else {
          this.error = result.error.message
        }
      } else {
        // Update the user data with the response.
        this.emailSent = true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#register {
  width: 400px;
  margin: 0 auto;

  .error-message {
    margin-bottom: 20px;
  }
}
</style>
