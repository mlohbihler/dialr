<template>
  <div>
    This is the login page
  </div>
  <!-- <WrapperPublic :footer="false"> -->
    <!-- <div class="bg-cool-blue clearfix content-wrapper"> -->
      <!-- <div class="jumbotron bg-transparent"> -->
        <!-- <div id="login-box" class="container-fluid bg-white xl-padding-horizontal"> -->
          <!-- <div class="col-md-6 clearfix"> -->
            <!-- <form @submit.prevent="submitter"> -->
              <!-- <div class="xl-margin-vertical"> -->
                <!-- <h1 class="text-left">Log in</h1> -->

                <!-- <template v-if="notVerified"> -->
                  <!-- <template v-if="resendComplete"> -->
                    <!-- Your email verification email has been resent. Please check your email inbox, and if you don't find a message from -->
                    <!-- noreply@mannabase.com, please check your spam folder. -->
                    <!-- <Button type="button" class="btn btn-primary btn-lg btn-xl full-width lg-margin-top" @click="resetLogin">Login</Button> -->
                  <!-- </template> -->
                  <!-- <template v-else> -->
                    <!-- Your account has not yet been activated. You should have received an email with a link to visit to verify your email address. -->
                    <!-- <div class="md-margin-top"> -->
                      <!-- <vue-recaptcha ref="recaptcha" sitekey="6LdAjkIUAAAAAHWAGTC2DeniBxWK7tGcMznmI6Yr" @verify="onVerify" @expired="onExpired"/> -->
                    <!-- </div> -->
                    <!-- <div v-if="recaptchaError" class="alert alert-danger" role="alert">{{ recaptchaError }}</div> -->

                    <!-- <Button type="button" class="btn btn-primary btn-lg btn-xl full-width lg-margin-top" :disabled="!recaptcha" :loading="inProgress" -->
                        <!-- @click="resendActivation">Resend activation email</Button> -->
                  <!-- </template> -->
                <!-- </template> -->

                <!-- <template v-else> -->
                  <!-- <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div> -->

                  <!-- <input type="text" required placeholder="Username or email" class="form-control md-margin-top input-lg" v-model="usernameEmail" autocomplete="username" /> -->
                  <!-- <input type="password" required placeholder="Password" class="form-control md-margin-top input-lg" v-model="password" /> -->
                  <!-- <input type="text" placeholder="TFA one-time password" class="form-control md-margin-top input-lg" v-model="otp" /> -->
                  <!-- <p class="input-instruction">Enter a value in the field above if you have enabled TFA on your account. Otherwise leave it empty.</p> -->

                  <!-- <div class="md-margin-top"> -->
                    <!-- <vue-recaptcha ref="recaptcha" sitekey="6LdAjkIUAAAAAHWAGTC2DeniBxWK7tGcMznmI6Yr" @verify="onVerify" @expired="onExpired"/> -->
                  <!-- </div> -->
                  <!-- <div v-if="recaptchaError" class="alert alert-danger" role="alert">{{ recaptchaError }}</div> -->

                  <!-- <Button class="btn btn-primary btn-lg btn-xl full-width lg-margin-top" :disabled="!recaptcha" :loading="inProgress"> -->
                    <!-- Log in<span class="fa fa-arrow-right sm-margin-left"></span> -->
                  <!-- </Button> -->
                  <!-- <div class="row xl-margin-top"> -->
                    <!-- <div class="col-md-5"> -->
                    <!-- </div> -->
                    <!-- <div class="col-md-7 text-right"> -->
                      <!-- <router-link :to="{ name: 'register' }"><p>Don't have an account yet?</p></router-link> -->
                      <!-- <br/> -->
                      <!-- <router-link :to="{ name: 'resetPassword' }"><p>Forgot your password?</p></router-link> -->
                    <!-- </div> -->
                  <!-- </div> -->
                <!-- </template> -->
              <!-- </div> -->
            <!-- </form> -->
          <!-- </div> -->
          <!-- <div class="col-md-6 clearfix bg-image-login login-block"></div> -->
        <!-- </div> -->
      <!-- </div> -->
    <!-- </div> -->
  <!-- </WrapperPublic> -->
</template>

<script>
// import Button from '../includes/Button'
// import VueRecaptcha from 'vue-recaptcha'
// import WrapperPublic from '../includes/WrapperPublic'

// import { post } from '@/api'
// import { localUrl } from '@/util'
// import { mapMutations, mapState } from 'vuex'

export default {
  name: 'Login',
  // components: { Button, VueRecaptcha, WrapperPublic },
  data() {
    return {
      // usernameEmail: '',
      // password: '',
      // inProgress: false,
      // error: null,
      // notVerified: false,
      // recaptcha: null,
      // recaptchaError: null,
      // resendComplete: false,
      // otp: ''
    }
  },
  // mounted() {
  //   // Default the email address if we have it.
  //   this.usernameEmail = this.anonData.email
  // },
  // computed: {
  //   ...mapState({
  //     anonData: state => state.anonData,
  //     postLoginRoute: state => state.postLoginRoute
  //   })
  // },
  // methods: {
  //   ...mapMutations(['setUserData']),
  //   submitter() {
  //     this.recaptchaError = !this.recaptcha ? `Please prove you're not a robot` : null
  //     if (this.recaptchaError) {
  //       return
  //     }

  //     this.inProgress = true
  //     post('/session', {
  //       usernameEmail: this.usernameEmail,
  //       recaptchaResponse: this.recaptcha,
  //       password: this.password,
  //       otp: this.otp
  //     })
  //       .then(result => {
  //         this.inProgress = false
  //         this.error = null
  //         if (result.error) {
  //           if (result.error.code === 'session-login-3') {
  //             this.error = 'Login was not successful'
  //           } else if (result.error.code === 'session-login-8') {
  //             let desc = ''
  //             if (result.error.params && result.error.params[0]) {
  //               desc = ': ' + result.error.params[0]
  //             }
  //             this.error = `There was a problem with the reCAPTCHA token${desc}`
  //           } else if (result.error.code === 'session-login-6') {
  //             this.notVerified = true
  //           } else if (result.error.code === 'session-login-9') {
  //             this.error = 'Incorrect one-time password'
  //           } else {
  //             this.error = result.error.message
  //           }
  //           this.$refs.recaptcha.reset()
  //         } else {
  //           // Update the user data with the response.
  //           this.setUserData(result.user)

  //           // Check if there is a forward action in the store.
  //           let forward = { name: 'dashboard' }
  //           if (this.postLoginRoute) {
  //             forward = this.postLoginRoute
  //             this.$store.commit('setPostLoginRoute', null)
  //           } else {
  //             forward = { name: 'dashboard' }
  //           }
  //           this.$router.push(forward)
  //         }
  //       })
  //   },
  //   onExpired() {
  //     this.recaptcha = null
  //   },
  //   onVerify(response) {
  //     this.recaptcha = response
  //     this.recaptchaError = null
  //   },
  //   resendActivation() {
  //     this.recaptchaError = !this.recaptcha ? `Please prove you're not a robot` : null
  //     if (this.recaptchaError) {
  //       return
  //     }

  //     this.inProgress = true

  //     post('/register/resend-activation-email', {
  //       usernameEmail: this.usernameEmail,
  //       recaptchaResponse: this.recaptcha,
  //       url: localUrl('/register-verify/{token}')
  //     })
  //       .then(result => {
  //         this.inProgress = false
  //         this.recaptchaError = null

  //         if (result.error) {
  //           if (result.error.code === 'register-resendActivationEmail-1') {
  //             this.recaptchaError = 'Your recaptcha token was not valid'
  //           } else {
  //             this.recaptchaError = result.error.message
  //           }
  //           this.$refs.recaptcha.reset()
  //         } else {
  //           this.resendComplete = true
  //         }
  //       })
  //   },
  //   resetLogin() {
  //     this.notVerified = false
  //     this.recaptcha = null
  //     this.resendComplete = false
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass" scoped>
// @import '../../styles/partials/variables'

// #login-box
//     min-height: 600px
//     position: relative
//     overflow: hidden
//     @media only screen and (min-width: map-get($breakpoints, md))
//         border-radius: 4px
// .login-block
//     min-height: 600px
//     background-repeat: no-repeat
//     background-position: center
//     background-size: cover
//     margin: 0 -50px
//     float: none
//     @media only screen and (min-width: map-get($breakpoints, md))
//         position: absolute
//         margin: 0
//         right: 0
//         top: 0
//         bottom: 0
//         margin: auto
//         transform: translateX(15px)
// .input-instruction
//     margin: 0
//     font-style: italic
//     font-size: smaller
//     padding: 0 10px
</style>


<script>
// <template>
//   <div class="wrapper narrow">
//     <header>
//       <h1>Login</h1>
//     </header>
//     <div class="c-card" ref="loginPanel">
//       <div class="intro">Please login to your account below.</div>
//       <form @submit.prevent="submitter" novalidate>
//         <TextField label="Email" type="email" placeholder="Your email" v-model="email" :required="true"
//             :class="{ error: emailError }" :errorMsg="emailError" @keyup.native="checkEmailKey" @blur="checkEmail"/>
//         <TextField label="Password" type="password" placeholder="Password" v-model="password" :required="true"
//             :class="{ error: passwordError }" :errorMsg="passwordError" @keyup.native="checkPassword" @blur="checkPassword"/>
//         <Button label="Login" :disabled="inProgress" :class="{ progress: inProgress }" />
//       </form>
//       <footer>
//         <div><router-link :to="{ name: 'forgotPassword' }">Forgot password?</router-link></div>
//         <div><router-link :to="{ name: 'resendVerification', params: { email: email } }" v-if="showVerificationResendLink">Resend address verification email</router-link></div>
//         <div class="noAccount"><strong>No account?</strong> <router-link :to="{ name: 'register' }">Create</router-link> an account.</div>
//         <div><router-link to="/">Learn more about Cadex Cloud</router-link></div>
//       </footer>
//     </div>
//   </div>
// </template>

// <script>
// import TextField from '../ui/TextField'
// import Button from '../ui/Button'

// import { post } from '@/api'
// import validator from 'validator'
// import { mapMutations, mapState } from 'vuex'

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
// </script>

// <!-- Add "scoped" attribute to limit CSS to this component only -->
// <style lang="scss" scoped>
//   form {
//     display: block;
//     margin: 20px 0 0 0;

//     & button {
//       width: 100%;
//       margin: 30px 0 0 0;
//     }
//   }
//   .intro {
//     margin: 0 0 20px 0;
//   }
//   footer {
//     text-align: center;
//     margin: 30px 0 20px 0;
//     font-size: 13px;

//     & div {
//       margin: 10px 0 0 0;
//     }
//   }
//   .shake {
//     animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
//     transform: translate3d(0, 0, 0);
//     backface-visibility: hidden;
//     perspective: 1000px;
//   }

//   @keyframes shake {
//     10%, 90% {
//       transform: translate3d(-1px, 0, 0);
//     }

//     20%, 80% {
//       transform: translate3d(2px, 0, 0);
//     }

//     30%, 50%, 70% {
//       transform: translate3d(-4px, 0, 0);
//     }

//     40%, 60% {
//       transform: translate3d(4px, 0, 0);
//     }
//   }
// </style>
</script>
