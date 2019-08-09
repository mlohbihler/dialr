/**
 * Copyright Serotonin Software 2019
 */
const { ensureNonEmptyString } = require('../ensure')
const { OAuth2Client } = require('google-auth-library')
const { apiPipeline, dbtx, user } = require('../pipeline')
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
    if (!user.password_hash) {
      tie('session-login-6', 'This user signs in with Google')
    }

    // Prevent email scraping by using the same error code
    testPasswordsAreEqual(user.password_hash, password, 'session-login-3', 'User not found')

    if (!user.verified) {
      tie('session-login-4', `User's email address is not verified`)
    }

    if (!user.active) {
      tie('session-login-5', 'User is not active')
    }

    finishLogin(user, res)
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

module.exports.glogin = (req, res) => {
  apiPipeline(req, res, [dbtx], async () => {
    const { body, db, logger } = req
    const token = ensureNonEmptyString(body.token, 'session-glogin-1', 'Invalid token')

    const client = new OAuth2Client(process.env.googleAuthClientId)
    let ticket
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.googleAuthClientId
      })
    } catch (err) {
      logger.info('Error verifying Google auth token', err)
      tie('session-glogin-2', 'Token not verified')
    }
    const payload = ticket.getPayload()
    const googleId = payload.sub
    const email = payload.email

    // Can't use an upsert here because there are two unique keys that could be in conflict.
    let rs = await db.query(`${userQuery} WHERE u.google_id = $1`, [googleId])

    if (!rs.rows.length) {
      // The googleId doesn't exist, so try to insert it with an upsert, because the email address
      // could already be registered.
      await db.query(`
        INSERT INTO users (google_id, email) VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE SET google_id = $1`,
        [googleId, email])
      
      // Now, reload the user data using the query
      rs = await db.query(`${userQuery} WHERE u.google_id = $1`, [googleId])
    } else {
      // The googleId was found. Ensure that the email address has not changed.
      const u = rs.rows[0]
      
      if (u.email !== email) {
        // The email address has changed. This can be a problem if the new email address is already
        // registered. Look for a user record with the new address.
        const dupRs = await db.query(`SELECT user_id FROM users WHERE email = $1`, [email])
        if (dupRs.rows.length) {
          // Yup, the email address already exists. Assign all of the data owned by the old id to
          // the new, delete the old row, and then update the email address of the new.
          const oldId = duprs.rows[0].user_id
          await db.query(`UPDATE access_keys SET user_id = $1 WHERE user_id = $2`, [u.user_id, oldId])
          await db.query(`UPDATE experiments SET user_id = $1 WHERE user_id = $2`, [u.user_id, oldId])
          await db.query(`DELETE FROM users WHERE user_id = $1`, [oldId])
          await db.query(`UPDATE users SET email = $1 WHERE user_id = $2`, [email, u.user_id])

          // Now, reload the user data using the query
          rs = await db.query(`${userQuery} WHERE u.google_id = $1`, [googleId])
        }
      }
    }

    const user = rs.rows[0]

    if (!user.verified) {
      // If the user is not verified, verify now.
      await db.query(`DELETE FROM email_verifications WHERE user_id = $1`, [user.user_id])
      user.verified = true
    }

    if (!user.active) {
      tie('session-glogin-3', 'User is not active')
    }

    finishLogin(user, res)
  })
}

function finishLogin(user, res) {
  const cookieData = {
    userId: user.user_id,
    expiry: new Date().getTime() + loginTokenExpiry
  }
  const token = sign(cookieData)

  // Set the token as a session cookie
  res.cookie(sessionTokenName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: loginTokenExpiry })

  // Respond
  respond(res, { user: writeUserRsToObject(user) })
}
