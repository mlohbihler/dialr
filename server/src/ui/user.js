/**
 * Copyright Serotonin Software 2019
 */
const { generateDbPassword, sign, tie, verify } = require('../common')
const { ensureEmail, ensureExists, ensurePassword, ensureString, ensureUrlWithToken } = require('../ensure')
const { apiPipeline, dbtx } = require('../pipeline')
const { consumeSingleUseToken, createSingleUseToken, sendEmail } = require('../remote')
const { respond } = require('../responses')

// const isString = require('lodash/isString')
// const randToken = require('rand-token')
// const { validateRecaptcha } = require('../remote')
// const { consumeSingleUseToken, createSingleUseToken, sendEmail } = require('../remote')
// const { respond } = require('../responses')
// const { ensureUrlWithToken, generateDbPassword, getUnsubscribeUrl, sign, tie, validatePassword, verify } = require('../util')

const ACCOUNT_VERIFICATION_EXPIRY_HOURS = 1 // One hour
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1 // One hour

module.exports.register = (req, res) => {
  apiPipeline(req, res, [dbtx], async () => {
    const email = ensureEmail(req.body.email, 'user-register-1', 'Email address is invalid')
    const passwordInput = ensureString(req.body.password, 'user-register-2', 'Password is invalid')
    // const recaptchaResponse = req.body.recaptchaResponse
    const url = ensureUrlWithToken(req.body.url, 'user-register-3')

    const password = ensurePassword(passwordInput, 'user-register-4')

    // // Validate the recaptcha response
    // return validateRecaptcha(process.env.RECAPTCHA_SECRET_KEY, recaptchaResponse)
    //   .then(response => {
    //     if (!response.success) {
    //       tie('register-register-12', 'Invalid reCAPTCHA response', response['error-codes'])
    //     }

    const dbhash = generateDbPassword(password)
    const { db, logger } = req

    // Insert the user record
    let userRs
    try {
      userRs = await db.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id`,
        [email, dbhash])
    } catch (err) {
      if (err.message.startsWith('duplicate key') && err.message.indexOf('users_email_key') !== -1) {
        tie('user-register-5', 'Email address is already registered')
      }
      throw err
    }

    const userId = userRs.rows[0].user_id

    // Insert the email verification record
    await db.query(`
      INSERT INTO email_verifications (user_id, expiry) VALUES
        ($1, NOW() + interval '${ACCOUNT_VERIFICATION_EXPIRY_HOURS} hour')
      `, [userId])

    // Send the verification email to the user.
    await sendVerificationEmail(email, url, logger, 'user-register-6')

    // Send the response to the user.
    respond(res)
  })
}

module.exports.resendVerificationEmail = (req, res) => {
  apiPipeline(req, res, [], async () => {
    const email = ensureEmail(req.body.email, 'user-resendVerificationEmail-1', 'Email address is invalid')
    // const recaptchaResponse = req.body.recaptchaResponse
    const url = ensureUrlWithToken(req.body.url, 'user-resendVerificationEmail-2')

    // // Validate the recaptcha response
    // return validateRecaptcha(process.env.RECAPTCHA_SECRET_KEY, recaptchaResponse)
    //   .then(response => {
    //     if (!response.success) {
    //       tie('register-resendVerificationEmail-1', 'Invalid reCAPTCHA response', response['error-codes'])
    //     }

    const rs = await req.db.query(`
      SELECT u.email
      FROM users u
        JOIN email_verifications e ON u.user_id = e.user_id
      WHERE email = $1
      `, [email])

    if (rs.rows.length === 0) {
      tie('user-resendVerificationEmail-3', 'Pending email verification not found')
    }

    // Send the verification email to the user.
    await sendVerificationEmail(email, url, req.logger, 'user-resendVerificationEmail-4')

    respond(res)
  })
}

module.exports.activateRegistration = (req, res) => {
  apiPipeline(req, res, [], async () => {
    const hexToken = ensureExists(req.body.token, 'user-activateRegistration-1', 'Missing token')
    const token = Buffer.from(hexToken, 'hex').toString()
    const verification = ensureExists(verify(token), 'user-activateRegistration-2', 'Invalid token')
    if (verification.indexOf('activate:') !== 0) {
      tie('user-activateRegistration-3', 'Invalid token')
    }

    const email = verification.substring(9)

    // Mark the user as active in auth_user.
    const rs = await req.db.query(
      `DELETE FROM email_verifications WHERE user_id = (SELECT user_id FROM users WHERE email=$1)`,
      [email])

    if (rs.rowCount === 0) {
      tie('user-activateRegistration-4', 'Pending verification not found')
    }

    respond(res, { email })
  })
}

/**
 * Starts the process of a password reset by sending an email to the user with a password reset token.
 */
module.exports.requestPasswordReset = (req, res) => {
  apiPipeline(req, res, [], async () => {
    const email = ensureEmail(req.body.email, 'user-requestPasswordReset-1', 'Email address is invalid')
    // const recaptchaResponse = req.body.recaptchaResponse
    const url = ensureUrlWithToken(req.body.url, 'user-requestPasswordReset-2')

    // if (!isString(req.body.recaptchaResponse)) {
    //   tie('register-requestPasswordReset-2', 'recaptchaResponse is missing')
    // }

    // return validateRecaptcha(process.env.RECAPTCHA_SECRET_KEY, req.body.recaptchaResponse)
    //   .then(response => {
    //     if (!response.success) {
    //       tie('register-requestPasswordReset-4', 'Invalid reCAPTCHA response', response['error-codes'])
    //     }

    const rs = await req.db.query('SELECT email FROM users WHERE email = $1', [email])
    if (!rs.rows.length) {
      tie('user-requestPasswordReset-3', 'email address not found')
    }

    const token = await createSingleUseToken(req.db, PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60, { email: email })

    await sendUiEmail({
      to: email,
      subject: 'DiaLR password reset',
      textTemplate: 'passwordResetEmail.hbs',
      data: {
        email,
        url: url.replace('{token}', token),
        resetInterval: PASSWORD_RESET_TOKEN_EXPIRY_HOURS + ' hour' + (PASSWORD_RESET_TOKEN_EXPIRY_HOURS === 1 ? '' : 's')
      }
    }, req.logger, 'user-requestPasswordReset-4')

    respond(res)
  })
}

module.exports.resetPassword = (req, res) => {
  apiPipeline(req, res, [], async () => {
    const token = ensureExists(req.body.token, 'user-resetPassword-1', 'Missing token')
    const password = ensurePassword(req.body.password, 'user-resetPassword-2')

    const data = await consumeSingleUseToken(req.db, token)

    if (!data) {
      tie('register-resetPassword-3', 'token is invalid, already used, or has expired')
    }

    const email = data.content.email
    const dbhash = generateDbPassword(password)

    await req.db.query('UPDATE users SET password_hash = $1 WHERE email=$2', [dbhash, email])

    respond(res, { email })
  })
}

async function sendVerificationEmail(email, url, logger, errorCode) {
  await sendUiEmail({
    to: email,
    subject: 'Verify Your DiaLR Account',
    textTemplate: 'verificationEmail.hbs',
    data: {
      email,
      url: url.replace('{token}', Buffer.from(sign('activate:' + email)).toString('hex')),
      expiryInterval: ACCOUNT_VERIFICATION_EXPIRY_HOURS + ' hour' + (ACCOUNT_VERIFICATION_EXPIRY_HOURS === 1 ? '' : 's')
    }
  }, logger, errorCode)
}

async function sendUiEmail(opts, logger, errorCode) {
  try {
    await sendEmail(opts)
  } catch (err) {
    logger.error('Error sending email', err)
    tie(errorCode, 'There was a problem sending your verification email')
  }
}
