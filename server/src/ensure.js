/**
 * Copyright Serotonin Software 2019
 */
const { nullOrUndefined, tie } = require('./common')
const { isArray, isBoolean, isInteger, isNumber, isString } = require('lodash')
const validator = require('validator')

function ensureArray(value, code, message) {
  if (!isArray(value)) {
    tie(code, message)
  }
  return value
}

function ensureBoolean(value, code, message) {
  if (!isBoolean(value)) {
    tie(code, message)
  }
  return value
}

function ensureEmail(value, code, message) {
  if (!isString(value) || !validator.isEmail(value.trim())) {
    tie(code, message)
  }
  return value.trim().toLowerCase()
}

function ensureExists(value, code, message) {
  if (!value) {
    tie(code, message)
  }
  return value
}

function ensureInteger(value, code, message) {
  if (!isInteger(value)) {
    tie(code, message)
  }
  return value
}

function ensureNonEmptyString(input, code, message) {
  if (!isString(input) || !input.trim()) {
    tie(code, message)
  }
  return input.trim()
}

function ensureNumber(value, code, message) {
  if (!isNumber(value)) {
    tie(code, message)
  }
  return value
}

function ensurePassword(password, errorCode) {
  ensureString(password, errorCode, 'Password is invalid')
  // Ensure the password is sufficiently secure.
  let msg = null
  const val = (password || '').trim()
  msg = msg || (val.length >= 10 ? null : 'must be at least 10 characters')
  msg = msg || (val.match(/[A-Z]/) ? null : 'must contain upper case')
  msg = msg || (val.match(/[a-z]/) ? null : 'must contain lower case')
  msg = msg || (val.match(/[0-9]/) ? null : 'must contain a number')
  msg = msg || (val.match(/[~`!@#$%^&*()\-_=+[\]{}\\|:;'",.<>/?]/) ? null : 'must contain a symbol')

  if (msg) {
    tie(errorCode, `Password is not strong enough: ${msg}`)
  }
  return val
}

function ensureString(value, code, message) {
  if (!isString(value)) {
    tie(code, message)
  }
  return value
}

function ensureStringLength(value, min, max, code, message) {
  if (!isString(value) || (min && value.length < min) || (max && value.length > max)) {
    tie(code, message)
  }
  return value
}

function ensureUrlWithToken(input, code) {
  if (!isString(input)) {
    tie(code, 'url is missing or invalid')
  }
  if (input.indexOf('{token}') === -1) {
    tie(code, 'url must contain "{token}"')
  }
  return input
}

//
// Optional
//

function ensureOptionalString(input, code, message) {
  if (!nullOrUndefined(input)) {
    return ensureString(input, code, message)
  }
  return input
}

module.exports = {
  ensureArray,
  ensureBoolean,
  ensureEmail,
  ensureExists,
  ensureInteger,
  ensureNonEmptyString,
  ensureNumber,
  ensureOptionalString,
  ensurePassword,
  ensureString,
  ensureStringLength,
  ensureUrlWithToken
}

// const { isEmpty, isInteger, isPlainObject, isUndefined, size } = require('lodash')

// /**
//  * Used to validate ids that are passed via query parameter.
//  * @param {String} input the ids to validate
//  * @param {*} code the error code
//  * @param {*} message the error message
//  * @param {*} params the error parameters
//  */
// function ensureId(input, code, message, params) {
//   if (!/^[0-9]+$/.test(input)) {
//     tie(code, message, params)
//   }
//   return Number(input)
// }

// function ensureInteger(input, code, message) {
//   if (!isInteger(input)) {
//     tie(code, message)
//   }
//   return input
// }

// function ensureIsOneOf(input, valuesArr, code, message) {
//   if (!valuesArr.filter(e => e === input).length) {
//     tie(code, message)
//   }
//   return input
// }

// function ensureNotDuplicateKey(err, code, message) {
//   if (err.message.indexOf('duplicate key') !== -1) {
//     tie(code, message)
//   }
//   return err
// }

// function ensureNotEmpty(input, code, message) {
//   if (isEmpty(input)) {
//     tie(code, message)
//   }
//   return input
// }

// function ensureObject(input, code, message) {
//   if (!isPlainObject(input)) {
//     tie(code, message)
//   }
//   return input
// }

// function ensurePassword(input, code) {
//   if (!isString(input)) {
//     tie(code, 'Password is not a string')
//   }
//   return validatePassword(input, code)
// }

// function ensureRowCount(rs, count, code, message, params) {
//   if (rs.rowCount !== count) {
//     tie(code, message, params)
//   }
//   return rs
// }

// function ensureSelectCount(rs, count, code, message) {
//   const rscount = parseInt(rs.rows[0].count)
//   if (rscount !== count) {
//     tie(code, message, rscount)
//   }
//   return rs
// }

// //
// // Optional
// //

// function ensureOptionalInteger(input, code, message) {
//   if (!isUndefined(input)) {
//     return ensureInteger(input, code, message)
//   }
//   return input
// }

// function ensureOptionalObject(input, code, message) {
//   if (!isUndefined(input)) {
//     return ensureObject(input, code, message)
//   }
//   return input
// }
