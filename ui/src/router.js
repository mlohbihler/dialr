import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import AccessKeys from '@/views/AccessKeys'
import Experiments from '@/views/Experiments'
import Login from '@/views/Login'
import Logout from '@/views/Logout'

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
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: ensureUserDataLoaded
    },
    {
      path: '/access-keys',
      name: 'accessKeys',
      component: AccessKeys,
      beforeEnter: ensureAuthenticated
    },
    {
      path: '/experiments',
      name: 'experiments',
      component: Experiments,
      beforeEnter: ensureAuthenticated
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import(/* webpackChunkName: "register" */ '@/views/ForgotPassword')
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: forwardToExperimentsIfAuthenticated
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/register',
      name: 'register',
      component: () => import(/* webpackChunkName: "register" */ '@/views/Register')
    },
    {
      path: '/register/resend-verification',
      name: 'resendVerification',
      component: () => import(/* webpackChunkName: "register" */ '@/views/ResendVerification')
    },
    {
      path: '/register-verify/:token',
      name: 'registerVerify',
      component: () => import(/* webpackChunkName: "register" */ '@/views/RegisterVerify')
    },
    {
      path: '/reset-password/:token',
      name: 'resetPassword',
      component: () => import(/* webpackChunkName: "register" */ '@/views/ResetPassword')
    },
    {
      path: '*',
      redirect: { name: 'home' }
    }
  ]
})

function ensureUserDataLoaded(to, from, next) {
  loadUserData(userData => next())
}

// function ensureSuperuser(to, from, next) {
//   loadUserData(userData => {
//     if (!userData) {
//       next({ name: 'logout' })
//     } else if (!userData.superuser) {
//       next({ name: 'experiments' })
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

function forwardToExperimentsIfAuthenticated(to, from, next) {
  loadUserData(userData => {
    if (userData) {
      next({ name: 'experiments' })
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
