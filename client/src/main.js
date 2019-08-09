import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// eslint-disable-next-line no-undef
gapi.load('auth2', () => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
