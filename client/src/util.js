// import { get } from './api'
// import store from './store'

export function localUrl(path) {
  const u = window.location
  return `${u.protocol}//${u.host}${path}`
}

// export function staticUrl(path) {
//   const u = window.location
//   return `${u.protocol}//${process.env.STATIC_HOST_BASE}${path}`
// }

// export async function refreshUserData() {
//   const result = await get('/session')

//   // Indicate in the store that the user data has been loaded.
//   store.commit('setUserDataLoaded')
//   if (result.error) {
//     if (result.error.code === 'not-authenticated') {
//       store.commit('setUserData', null)
//       return null
//     }

//     console.log('ensureAuthenticated user is not authenticated', result.error.code)
//     throw Error(result.error)
//   }

//   // Put the user data into the store and continue with the route change.
//   store.commit('setUserData', result.user)
//   return result
// }

// /**
//  * Retries a predicate at the given rate until it is truthy, at which time it runs the callback.
//  * @param {Object} predicate the predicate to test
//  * @param {*} time the amount of time to wait before trying the predicate again
//  * @param {*} callback the callback to run when the predicate returns truthy
//  */
// export function poll(predicate, time, callback) {
//   if (predicate()) {
//     callback()
//   } else {
//     setTimeout(() => poll(predicate, time, callback), time)
//   }
// }

// export function loadScript(id, url) {
//   if (!document.getElementById(id)) {
//     const promise = new Promise((resolve, reject) => {
//       let script = document.createElement('script')
//       script.id = id
//       script.onload = () => resolve()
//       script.async = true
//       script.src = url
//       document.head.appendChild(script)
//     })
//     return promise
//   }
//   return Promise.resolve()
// }

/**
 * This, too, is needed for unit tests.
 */
export default {
//   NETWORK_FEE,
//   loadScript,
  localUrl,
//   poll,
//   refreshUserData,
//   staticUrl
}

//
//
//
//
//

// import { get } from './api'
// import dateformat from 'dateformat'
// import { isArray, isDate, isNumber, isString, remove } from 'lodash'
// import store from './store'

// export function download(ep, params) {
//   let query = ''
//   if (params) {
//     for (const k in params) {
//       query += (query ? '&' : '?') + k + '='
//       if (isArray(params[k])) {
//         params[k].forEach((v, i) => {
//           query += (i === 0 ? '' : ',') + encodeURIComponent(v)
//         })
//       } else {
//         query += encodeURIComponent(params[k])
//       }
//     }
//   }
//   lib.redirect(`${process.env.API_BASE}${ep}${query}`)
// }

// // This line of code can't be tested in unit tests, so this
// // function gets overridden by test code.
// function redirect(href) {
//   window.location.href = href
// }

// export function formatDate(ts) {
//   return ts ? dateformat(ts, 'mmm d, yyyy') : ''
// }

// export function formatTime(ts) {
//   return ts ? dateformat(ts, 'h:MM TT') : ''
// }

// export function formatTimestamp(ts) {
//   return ts ? dateformat(ts, 'mmm d, yyyy HH:MM') : ''
// }

// /**
//  * Turns the given timestamp into a date object.
//  * @param {Number, null} ts Millisecond timestamp or null
//  */
// export function tsToDate(ts) {
//   return ts ? new Date(ts) : null
// }

// export function dateToTs(d) {
//   return d ? d.getTime() : null
// }

// export function refreshUserData() {
//   return new Promise((resolve, reject) => {
//     get('/session')
//       .then(result => {
//         // Indicate in the store that the user data has been loaded.
//         store.commit('setUserDataLoaded')
//         if (result.error) {
//           if (result.error.code === 'not-authenticated') {
//             store.commit('setUserData', { userData: null })
//             resolve(null)
//           } else {
//             console.log('ensureAuthenticated user is not authenticated', result.error.code)
//             reject(Error(result.error))
//           }
//         } else {
//           // Put the user data into the store and continue with the route change.
//           store.commit('setUserData', { userData: result })
//           resolve(result)
//         }
//       })
//   })
// }

// export function findKeywordsIn(keywords) {
//   // Get the lower case versions of truthy arguments.
//   const args = []
//   for (let i = 1; i < arguments.length; i++) {
//     if (arguments[i]) {
//       args.push(arguments[i].toLowerCase())
//     }
//   }

//   let keyword
//   for (let i = 0; i < keywords.length; i++) {
//     keyword = keywords[i].toLowerCase()
//     let found = false
//     for (let j = 0; j < args.length; j++) {
//       if (args[j].indexOf(keyword) !== -1) {
//         found = true
//         break
//       }
//     }
//     if (!found) {
//       return false
//     }
//   }
//   return true
// }

// export function mergeColumns(columnDefinitions, columnSettings) {
//   // Make a copy of the column defintions that we can mutate
//   const defs = [ ...columnDefinitions ]
//   // Add each of the columns from the settings if it is still valid. Remove the key from the defs at the same time.
//   const cols = []
//   columnSettings.forEach(col => {
//     const removed = remove(defs, def => def.key === col.key)
//     if (removed.length) {
//       cols.push({ key: col.key, label: removed[0].label, sortable: removed[0].sortable, visible: col.visible })
//     }
//   })
//   // All definitions that remain are added to the columns with default settings
//   defs.forEach(def => cols.push({ ...def }))
//   return cols
// }

// /**
//  * If called with only `text`, the code will attempt to pluralize it.
//  * If called with `text` and `mult`, `text` is assumed to be the singular
//  */
// export function plur(count, text, mult) {
//   if (count === 1) {
//     return mult ? text : `1 ${text}`
//   }
//   if (mult) {
//     return mult
//   }
//   if (text[text.length - 1] === 'y') {
//     return `${count} ${text.substring(0, text.length - 1)}ies`
//   }
//   if (text[text.length - 1] === 's') {
//     return `${count} ${text}es`
//   }
//   return `${count} ${text}s`
// }

// /**
//  * Retries a predicate at the given rate until it is truthy, at which time it runs the callback.
//  * @param {Object} predicate the predicate to test
//  * @param {*} time the amount of time to wait before trying the predicate again
//  * @param {*} callback the callback to run when the predicate returns truthy
//  */
// export function poll(predicate, time, callback) {
//   if (predicate()) {
//     callback()
//   } else {
//     setTimeout(() => poll(predicate, time, callback), time)
//   }
// }

// /**
//  * Converts the given parameters into a list of location options for use in a select menu component.
//  *
//  * @param {Array} allLocations list of all locations, usually as returned from the GET /locations endpoint
//  * @param {Array} allowedLocations list of allowed locations for the user, usually as returned from this.$store.getters.allowedLocations
//  * @param {String} noneLabel the label to use for null locations. The option is not included in the result if undefined.
//  */
// export function filterLocations(allLocations, allowedLocations, noneLabel) {
//   let locations = [ ...allLocations ]
//   if (allowedLocations !== null) {
//     // Filter for the allowed locations
//     locations = locations.filter(e => allowedLocations.indexOf(e.id) !== -1)
//   }
//   locations = locations
//     .map(e => ({ value: e.name, label: e.name }))
//     .sort((a, b) => a.label.localeCompare(b.label))
//   if (noneLabel !== undefined && allowedLocations === null) {
//     locations.splice(0, 0, { value: '', label: noneLabel })
//   }
//   return locations
// }

// export function dateCompare(d1, d2) {
//   const t1 = isDate(d1) ? d1.getTime() : (isNumber(d1) ? d1 : 0)
//   const t2 = isDate(d2) ? d2.getTime() : (isNumber(d2) ? d2 : 0)
//   return t1 - t2
// }

// // Transform the headers array into a map for quick lookup.
// export function columnsToIndexMap(columns) {
//   return columns.reduce((acc, cur, index) => {
//     acc[cur] = index
//     return acc
//   }, {})
// }

// export function nullSafeNoCaseStringCompare(a, b) {
//   if (a === null || a === undefined) {
//     a = ''
//   }
//   if (b === null || b === undefined) {
//     b = ''
//   }
//   return a.toLowerCase().localeCompare(b.toLowerCase())
// }

// /**
//  * @param {*} el the DOM element or its string ID
//  * @param {*} options overrides. Defaults are display='block', position='absolute', parent=el.parentNode
//  */
// export function getNewElementHeight(el, options) {
//   if (isString(el)) {
//     el = document.getElementById(el)
//   }
//   let cln = el.cloneNode(true)
//   cln.style.opacity = '0'
//   cln.style.visibility = 'hidden'
//   cln.style.height = 'auto'
//   cln.style.display = (options && options.display) || 'block'
//   cln.style.position = (options && options.position) || 'absolute'
//   cln.style.width = '100%'
//   const parent = (options && options.parent) || el.parentNode
//   parent.appendChild(cln)
//   const height = cln.clientHeight
//   // cln.remove() not supported in IE 11 - use removeChild
//   cln.parentNode.removeChild(cln)
//   return height
// }

// /**
//  * This object is provided to allow unit testing. Creating this
//  * object allows the redirect function to be mocked, as long as
//  * the clients of the function call it via this lib.
//  */
// const lib = {
//   redirect
// }

// /**
//  * This, too, is needed for unit tests.
//  */
// export default {
//   columnsToIndexMap,
//   dateCompare,
//   dateToTs,
//   download,
//   filterLocations,
//   findKeywordsIn,
//   formatDate,
//   formatTime,
//   formatTimestamp,
//   getNewElementHeight,
//   lib,
//   mergeColumns,
//   nullSafeNoCaseStringCompare,
//   plur,
//   poll,
//   refreshUserData,
//   tsToDate
// }
