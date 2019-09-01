import axios from 'axios'
import store from './store'
import { localUrl } from './util'

export function get(ep, params) {
  return rest(ep, 'get', params)
}

export function patch(ep, data) {
  return rest(ep, 'patch', null, data)
}

export function post(ep, data) {
  return rest(ep, 'post', null, data)
}

export function put(ep, data) {
  return rest(ep, 'put', null, data)
}

export function dele(ep, data) {
  return rest(ep, 'delete', null, data)
}

async function rest(ep, method, params, data, headers = {}) {
  if (store.state.userData && store.state.userData.token) {
    headers.Authorization = `Bearer ${store.state.userData.token}`
  }
  try {
    const response = await axios({
      method,
      baseURL: process.env.VUE_APP_API_BASE || localUrl('/ui'),
      url: ep,
      params,
      data,
      headers,
      timeout: 30000,
      withCredentials: true,
      validateStatus: status => (status >= 200 && status < 300) || status === 400
    })
    return response.data
  } catch (err) {
    console.error('Error in response', err)
    store.commit('setApiError', err)
    // Rethrow the error so that "then"s for the the requestor are not run.
    throw err
  }
}

/**
 * This is needed for unit tests.
 */
export default {
  dele,
  get,
  patch,
  post,
  put,
  rest
}
