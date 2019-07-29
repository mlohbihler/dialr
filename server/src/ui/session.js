/**
 * Copyright Serotonin Software 2019
 */
const { ensureNonEmptyString } = require('../ensure')
const { apiPipeline, user } = require('../pipeline')
const { respond } = require('../responses')
const { userQuery, sessionTokenName, sign, testPasswordsAreEqual, tie, writeUserRsToObject } = require('../common')

const loginTokenExpiry = 1000 * 60 * 60 * 24 * 30 // 30 days

module.exports.login = (req, res) => {
  apiPipeline(req, res, [], async () => {
    const { body } = req
    const emailInput = ensureNonEmptyString(body.email, 'session-login-1', 'Invalid email')
    const password = ensureNonEmptyString(body.password, 'session-login-2', 'Invalid password')

    // TODO recaptcha
    // const recaptchaResponse = req.body.recaptchaResponse

    // if (!isString(recaptchaResponse)) {
    //   tie('session-login-7', 'recaptchaResponse is missing')
    // }

    // const response = await validateRecaptcha(process.env.RECAPTCHA_SECRET_KEY, req.body.recaptchaResponse)
    // if (!response.success) {
    //   tie('session-login-8', 'Invalid reCAPTCHA response', response['error-codes'])
    // }

    const email = emailInput.toLowerCase().trim()

    // Find the user with the given email
    const rs = await req.db.query(`${userQuery} WHERE u.email = $1`, [email])

    if (!rs.rows.length) {
      tie('session-login-3', 'User not found')
    }

    const user = rs.rows[0]

    // Prevent email scraping by using the same error code
    testPasswordsAreEqual(user.password_hash, password, 'session-login-3', 'User not found')

    if (!user.verified) {
      tie('session-login-4', `User's email address is not verified`)
    }

    if (!user.active) {
      tie('session-login-5', 'User is not active')
    }

    const cookieData = {
      userId: user.user_id,
      expiry: new Date().getTime() + loginTokenExpiry
    }
    const token = sign(cookieData)

    // Set the token as a session cookie
    res.cookie(sessionTokenName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: loginTokenExpiry })

    // Respond
    respond(res, { user: writeUserRsToObject(user) })
  })
}

module.exports.getCurrentUser = (req, res) => {
  apiPipeline(req, res, [user()], () => {
    respond(res, { user: writeUserRsToObject(req.user) })
  })
}

module.exports.logout = (req, res) => {
  res.cookie(sessionTokenName, '', { maxAge: 0, expires: 'Thu, 01 Jan 1970 00:00:00 GMT' })
  respond(res)
}
