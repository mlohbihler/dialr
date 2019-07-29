import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import Logout from '@/views/Logout'
import Register from '@/views/Register'
import RegisterVerify from '@/views/RegisterVerify'

import store from './store'
import { refreshUserData } from './util'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { x: 0, y: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: Home, beforeEnter: ensureUserDataLoaded },
    { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "about" */ './views/About.vue') },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, beforeEnter: ensureAuthenticated },
    { path: '/login', name: 'login', component: Login, beforeEnter: forwardToDashboardIfAuthenticated },
    { path: '/logout', name: 'logout', component: Logout },
    { path: '/register', name: 'register', component: Register },
    { path: '/register-verify/:token', name: 'registerVerify', component: RegisterVerify },
    { path: '*', redirect: { name: 'home' } }

    // { path: '/about', name: 'about', component: About, beforeEnter: ensureUserDataLoaded },
    // { path: '/admin', name: 'admin', component: Admin, beforeEnter: ensureSuperuser },
    // { path: '/change-email-verify/:token', name: 'changeEmailVerify', component: ChangeEmailVerify, beforeEnter: ensureAuthenticated },
    // { path: '/pay-with-mannabase', name: 'payWithMannabase', component: PayWithMannabase, beforeEnter: ensureUserDataLoaded },
    // { path: '/privacy-policy', name: 'privacyPolicy', component: PrivacyPolicy, beforeEnter: ensureUserDataLoaded },
    // { path: '/reset-password', name: 'resetPassword', component: ResetPassword },
    // { path: '/reset-password-verify/:token', name: 'resetPasswordVerify', component: ResetPasswordVerify },
    // { path: '/send-coins-confirm/:token', name: 'sendCoinsConfirm', component: SendCoinsConfirm, beforeEnter: ensureAuthenticated },
    // { path: '/settings', name: 'settings', component: Settings, beforeEnter: ensureAuthenticated },
    // { path: '/share/:refId?', name: 'share', component: Share, beforeEnter: forwardToDashboardIfAuthenticated },
    // { path: '/support', name: 'support', component: Support, beforeEnter: ensureUserDataLoaded },
    // { path: '/technology', name: 'technology', component: Technology, beforeEnter: ensureUserDataLoaded },
    // { path: '/terms-of-service', name: 'termsOfService', component: TermsOfService, beforeEnter: ensureUserDataLoaded },
    // { path: '/ubi-signup', name: 'ubiSignup', component: UbiSignup, beforeEnter: ensureAuthenticated },
  ]
})

// import About from '@/components/pages/About'
// import Admin from '@/components/pages/Admin'
// import ChangeEmailVerify from '@/components/pages/ChangeEmailVerify'
// import PayWithMannabase from '@/components/pages/PayWithMannabase'
// import PrivacyPolicy from '@/components/pages/PrivacyPolicy'
// import Register from '@/components/pages/Register'
// import RegisterVerify from '@/components/pages/RegisterVerify'
// import ResetPassword from '@/components/pages/ResetPassword'
// import ResetPasswordVerify from '@/components/pages/ResetPasswordVerify'
// import SendCoinsConfirm from '@/components/pages/SendCoinsConfirm'
// import Technology from '@/components/pages/Technology'
// import TermsOfService from '@/components/pages/TermsOfService'
// import Settings from '@/components/pages/Settings'
// import Share from '@/components/pages/Share'
// import Support from '@/components/pages/Support'
// import UbiSignup from '@/components/pages/UbiSignup'

function ensureUserDataLoaded(to, from, next) {
  loadUserData(userData => next())
}

// function ensureSuperuser(to, from, next) {
//   loadUserData(userData => {
//     if (!userData) {
//       next({ name: 'logout' })
//     } else if (!userData.superuser) {
//       next({ name: 'dashboard' })
//     } else {
//       next()
//     }
//   })
// }

/**
 * Tests that the user is authenticated before allowing access to a route. This will
 * also check that the user data has been loaded from the server, and if not will
 * attempt to load it.
 * @param {*} to the route we're going to
 * @param {*} from the route we're coming from
 * @param {Function} next the function to resolve the action
 */
function ensureAuthenticated(to, from, next) {
  loadUserData(userData => {
    if (userData) {
      next()
    } else {
      next({ name: 'login' })
    }
  })
}

function forwardToDashboardIfAuthenticated(to, from, next) {
  loadUserData(userData => {
    if (userData) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })
}

function loadUserData(cb) {
  if (!store.state.userDataLoaded) {
    refreshUserData().then(() => cb(store.state.userData))
  } else {
    cb(store.state.userData)
  }
}
