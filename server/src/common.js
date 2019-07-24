/**
 * Copyright Matthew Lohbihler 2019
 *
 * This module is for functions that do not cause side effects, such that they
 *  are safe for use in unit tests. (I.e. they do not need to be mocked.)
 */
const crypto = require('crypto')
// const dateFormat = require('dateformat')
// const { isString } = require('lodash')
const pbkdf2 = require('pbkdf2')
const randToken = require('rand-token')

const inputErrorMessage = 'input-error'
const passwordHashAlgo = 'sha512'
const sessionTokenName = 'dialr'

function getCookie(req, name) {
  if (req.headers) {
    var value = '; ' + req.headers.cookie
    var parts = value.split('; ' + name + '=')
    if (parts.length === 2) {
      return parts.pop().split(';').shift()
    }
  }
  return null
}

function verify(str) {
  if (!str) {
    return
  }

  const parts = str.split(':')
  if (parts.length !== 3) {
    return
  }

  const sig = hmac(parts[0] + ':' + parts[1])
  if (sig !== parts[2]) {
    // Signature failure
    return
  }

  // Signature match
  const json = Buffer.from(parts[0], 'base64').toString('ascii')
  return JSON.parse(json)
}

function hmac(str) {
  return crypto.createHmac('sha512', process.env.secretKey).update(str).digest('base64')
}

function testPasswordsAreEqual(dbPassword, givenPassword, errorCode, errorMessage) {
  const passwordParts = dbPassword.split('$')
  if (passwordParts.length !== 4) {
    throwInputError('util-testPasswordsAreEqual-1', 'Cannot validate password')
  }

  const algo = passwordParts[0]
  const iterations = parseInt(passwordParts[1])
  const salt = passwordParts[2]
  const dbhash = passwordParts[3]

  const hash = getPasswordHash(givenPassword, salt, iterations, algo)
  if (hash !== dbhash) {
    throwInputError(errorCode, errorMessage)
  }
}

function getPasswordHash(password, salt, iterations, algo) {
  return pbkdf2.pbkdf2Sync(password, salt, iterations, 32, algo).toString('base64')
}

function sign(obj) {
  const json = Buffer.from(JSON.stringify(obj)).toString('base64')
  const salt = randToken.generate(10)
  const sig = hmac(json + ':' + salt)
  return json + ':' + salt + ':' + sig
}

/**
 * Generate the password to store in the database from the given plain text password.
 * @param {String} password
 */
function generateDbPassword(password) {
  const algo = passwordHashAlgo
  const iterations = 36000
  const salt = randToken.generate(14)
  const hash = getPasswordHash(password, salt, iterations, algo)
  return algo + '$' + iterations + '$' + salt + '$' + hash
}

function createInputError(code, message, params) {
  const err = Error(inputErrorMessage)
  err.data = { code, message, params }
  return err
}

function throwInputError(code, message, params) {
  throw createInputError(code, message, params)
}

// This query is used in multiple places in the app, and it should dovetail with
// writeUserRsToObject below, so we define it here.
const userQuery = `
  SELECT u.user_id, u.email, u.password_hash, u.active, u.max_access_keys, u.max_experiments, u.max_branches,
    CASE WHEN e.user_id IS NULL THEN true ELSE false END AS verified
  FROM users u
    LEFT JOIN email_verifications e ON u.user_id = e.user_id`

function writeUserRsToObject(user) {
  if (!user) {
    return null
  }
  return {
    id: user.user_id,
    email: user.email
  }
}

module.exports = {
  generateDbPassword,
  getCookie,
  inputErrorMessage,
  sessionTokenName,
  sign,
  testPasswordsAreEqual,
  tie: throwInputError,
  throwInputError,
  userQuery,
  verify,
  writeUserRsToObject
}

// const crypto = require('crypto')
// const dateFormat = require('dateformat')
// const { isString } = require('lodash')
// const pbkdf2 = require('pbkdf2')
// const randToken = require('rand-token')

// function getUnsubscribeUrl(email) {
//   const token = sign('unsubscribe:' + email)
//   // return process.env.URL_BASE +"/api/unsubscribeFromMailingList"
//   return process.env.DISTRIBUTION_SERVICE_PUBLIC + '/api/unsubscribe-token' +
//       '?t=' + encodeURIComponent(token) +
//       '&r=' + encodeURIComponent('https://www.mannabase.com/unsubscribed')
// }

// function ensureUrlWithToken(input, code) {
//   if (!isString(input)) {
//     throwInputError(code, 'url is missing or invalid')
//   }
//   if (input.indexOf('{token}') === -1) {
//     throwInputError(code, 'url must contain "{token}"')
//   }
//   return input
// }
