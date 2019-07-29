<!-- Copyright Serotonin Software 2019 -->
<template>
  <div id="login">
    <p v-if="verified">
      <strong>Nice! Your email address was verified, and you're all set. Go ahead and log in.</strong>
    </p>
    <form @submit.prevent="tryLogin" novalidate>
      <FormText label="Email" required type="email" placeholder="Email" v-model="email" autoFocus/>
      <FormText label="Password" required type="password" placeholder="Password" v-model="password"/>
      <div v-if="error" class="error-message">{{ error }}</div>
      <FormButton :disabled="inProgress" :loading="inProgress">Login</FormButton>
    </form>
    <div>
      <router-link to="/">Forgot your password?</router-link>
    </div>
    <div class="links">
      <strong>No account?</strong>&nbsp;
      <router-link to="register">Create one.</router-link>
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
  name: 'Login',
  components: { FormButton, FormText },
  data() {
    return {
      verified: false,
      email: '',
      password: '',
      inProgress: false,
      error: null,
      notVerified: false,
      // resendComplete: false,
      // otp: ''
    }
  },
  beforeMount() {
    const verified = this.$route.params.verified
    if (verified) {
      this.verified = true
      this.email = verified
    // } else if (this.$route.params.resetPassword) {
    //   // A redirect from the reset password page
    //   this.email = this.$route.params.resetPassword
    //   this.raiseNotification('Password Reset', 'Your password reset was successful. You may now log in.', 'success')
    // } else if (this.$route.params.status === 'loggedOut') {
    //   this.raiseNotification('Logged Out', 'You have been logged out.', 'success')
    }
  },
  methods: {
    ...mapMutations(['setUserData']),
    async tryLogin() {
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
          this.notVerified = true
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
    },
    // resendActivation() {
    //   this.recaptchaError = !this.recaptcha ? `Please prove you're not a robot` : null
    //   if (this.recaptchaError) {
    //     return
    //   }

    //   this.inProgress = true

    //   post('/register/resend-activation-email', {
    //     usernameEmail: this.usernameEmail,
    //     recaptchaResponse: this.recaptcha,
    //     url: localUrl('/register-verify/{token}')
    //   })
    //     .then(result => {
    //       this.inProgress = false
    //       this.recaptchaError = null

    //       if (result.error) {
    //         if (result.error.code === 'register-resendActivationEmail-1') {
    //           this.recaptchaError = 'Your recaptcha token was not valid'
    //         } else {
    //           this.recaptchaError = result.error.message
    //         }
    //         this.$refs.recaptcha.reset()
    //       } else {
    //         this.resendComplete = true
    //       }
    //     })
    // },
    // resetLogin() {
    //   this.notVerified = false
    //   this.recaptcha = null
    //   this.resendComplete = false
    // }
  }
}

// export default {
//   data () {
//     return {
//       email: '',
//       password: '',
//       emailError: '',
//       passwordError: '',
//       inProgress: false,
//       showVerificationResendLink: false
//     }
//   },
//   components: { TextField, Button },
//   beforeMount() {
//     const verify = this.$route.params.verify
//     if (verify) {
//       // A redirect from the email verification page
//       if (verify === 'success') {
//         this.raiseNotification('Verification Successful', 'Your email address has been verified. You may now log in.', 'success')
//       } else {
//         this.raiseNotification('Email Already Verified', 'Your email address was already verified. You may now log in.', 'success')
//       }
//     } else if (this.$route.params.resetPassword) {
//       // A redirect from the reset password page
//       this.email = this.$route.params.resetPassword
//       this.raiseNotification('Password Reset', 'Your password reset was successful. You may now log in.', 'success')
//     } else if (this.$route.params.status === 'loggedOut') {
//       this.raiseNotification('Logged Out', 'You have been logged out.', 'success')
//     }
//   },
//   computed: {
//     ...mapState({
//       postLoginRoute: state => state.postLoginRoute
//     }),
//     formError() {
//       return this.emailError !== null || this.passwordError !== null
//     }
//   },
//   methods: {
//     ...mapMutations(['setPostLoginRoute', 'setUserData']),
//     submitter(e) {
//       this.checkEmail()
//       this.checkPassword()
//       if (this.formError) {
//         return
//       }

//       this.inProgress = true

//       return post('/session', {
//         email: this.email,
//         password: this.password
//       })
//         .then(json => {
//           if (json.error) {
//             if (json.error.code === 'session-login-3' || json.error.code === 'session-login-6') {
//               this.raiseNotification('Could Not Login', 'Your email or password was incorrect. Please try again.', 'error')
//               this.shakePanel()
//             } else if (json.error.code === 'session-login-4') {
//               this.raiseNotification('Not Verified Yet',
//                 'Your email address has not yet been verified. Use the link below to resend your verification email.', 'error')
//               this.showVerificationResendLink = true
//             } else if (json.error.code === 'session-login-7') {
//               this.raiseNotification('Account Disabled',
//                 `Your account has been disabled. Notify your company's administrator if you believe this was done in error.`, 'error')
//             } else {
//               // Other error types should not happen.
//               this.raiseNotification('Error', json.error.code, 'error')
//             }
//           } else {
//             // The JSON content is user data. Store it in the store.
//             this.setUserData({ userData: json })

//             // Check if there is a route to forward to in the store.
//             let forward = { name: 'dashboard' }
//             if (this.postLoginRoute) {
//               forward = this.postLoginRoute
//               this.setPostLoginRoute(null)
//             } else {
//               forward = { name: 'dashboard' }
//             }

//             // Forward to the dashboard
//             this.$router.push(forward)
//           }
//         })
//         .finally(() => {
//           this.inProgress = false
//         })
//     },
//     shakePanel() {
//       this.$refs.loginPanel.classList.add('shake')
//       setTimeout(() => {
//         this.$refs.loginPanel.classList.remove('shake')
//       }, 1000)
//     },
//     checkEmail(evt) {
//       if (!evt || evt.code !== 'Tab') {
//         if (this.email.length < 1) {
//           this.emailError = 'Email address is required'
//         } else if (this.email.length > 255) {
//           this.emailError = 'Email address cannot be longer than 255 characters'
//         } else if (!validator.isEmail(this.email)) {
//           this.emailError = 'This is not a valid email address'
//         } else {
//           this.emailError = null
//         }
//       }
//     },
//     checkEmailKey(evt) {
//       if (evt.code !== 'Tab') {
//         if (validator.isEmail(this.email)) {
//           this.emailError = null
//         } else if (this.emailError === null) {
//           this.emailError = 'This is not a valid email address'
//         }
//       }
//     },
//     checkPassword(evt) {
//       if (!evt || evt.code !== 'Tab') {
//         if (this.password.length > 0) {
//           this.passwordError = null
//         } else {
//           this.passwordError = 'Password is required'
//         }
//       }
//     },
//     raiseNotification(title, text, type) {
//       this.$notify({
//         group: 'page',
//         title,
//         text,
//         duration: 6000,
//         type
//       })
//     }
//   }
// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#login {
  width: 400px;
  margin: 0 auto;

  .error-message {
    margin-bottom: 20px;
  }

  .links {
    margin-bottom: 20px;
  }
}
</style>
