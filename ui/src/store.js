import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  /**
   * Stores errors that occurred during API calls. Can be used to raise error modals or similar user notifications.
   */
  apiError: null,

  /**
   * Data about what should happen after the user logs in.
   */
  postLoginRoute: null,

  /**
   * Current user data. This comes from the login request (POST /session) or current data request (GET /session).
   * The presence of an object here indicates to the client that there is a currently logged in user. If the value
   * is null, the user is anonymous.
   */
  userData: null,

  /**
   * Whether the client has attempted to load the user data yet or not. A user may visit any number of public pages
   * without the client making a user data request. Only a request to a private page will cause this to happen. The
   * request should only occur once per client load, so once this value is true, it is not changed again for the life
   * of the client instance.
   */
  userDataLoaded: false
}

export const mutations = {
  setApiError(state, err) {
    state.apiError = err
  },
  setPostLoginRoute(state, payload) {
    state.postLoginRoute = payload
  },
  setUserData(state, payload) {
    state.userData = payload
  },
  setUserDataLoaded(state) {
    state.userDataLoaded = true
  },
  updateUserData(state, payload) {
    state.userData = Object.assign({}, state.userData, payload)
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions: {

  }
})
