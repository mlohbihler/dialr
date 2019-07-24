/**
 * Copyright Matthew Lohbihler 2019
 */
const { tie } = require('./common')
const { isArray, isBoolean, isNumber, isString } = require('lodash')
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
  if (!isString(value) || !validator.isEmail(value)) {
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

function ensureNumber(value, code, message) {
  if (!isNumber(value)) {
    tie(code, message)
  }
  return value
}

function ensurePassword(password, errorCode) {
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
  if ((min && value.length < min) || (max && value.length > max)) {
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

module.exports = {
  ensureArray,
  ensureBoolean,
  ensureEmail,
  ensureExists,
  ensureNumber,
  ensurePassword,
  ensureString,
  ensureStringLength,
  ensureUrlWithToken
}
