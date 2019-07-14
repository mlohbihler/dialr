const fs = require('fs')
const Handlebars = require('handlebars')
const { isArray, isObject, isString } = require('lodash')
const nodemailer = require('nodemailer')
const randToken = require('rand-token')

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.smtpHost,
  port: process.env.smtpPort,
  secure: process.env.smtpTls === 'true',
  auth: {
    user: process.env.smtpUser,
    pass: process.env.smtpPass
  },
  tls: {
    ciphers: 'SSLv3'
  }
})

/**
 * Common function for sending an email. Options are:
 *  - from: the source email address. Defaults to process.env.smtpFromAddress
 *  - to: to address. Either a string or an array of strings.
 *  - subject: text literal of the subject line
 *  - subjectTemplate: filename of the template to use for the subject line
 *  - html: text literal of the HTML body content
 *  - htmlTemplate: filename of the template for the HTML body content
 *  - text: text literal of text body content
 *  - textTemplate: filename of the template for the text body content
 *  - data: content to provide to the template(s). The following keys are reserved:
 *
 * Template files are expected to be found in the "templates" subdirectory (or subdirectories of that) of the calling
 * service.
 */
module.exports.sendEmail = async (opts) => {
  if (!isObject(opts)) {
    throw Error('opts is not an object')
  }

  const from = opts.from || process.env.smtpFromAddress

  let to
  if (isString(opts.to)) {
    to = [opts.to]
  } else if (isArray(opts.to)) {
    to = opts.to
  } else {
    throw Error('To address(s) required (opts.to)')
  }

  let subject
  if (opts.subject) {
    subject = opts.subject
  } else if (opts.subjectTemplate) {
    subject = createContent(opts.subjectTemplate, opts.data)
  } else {
    throw Error('Subject is required (opts.subject or opts.subjectTemplate)')
  }
  // Ensure there are no line breaks in the subject
  subject = subject.replace(/\r?\n|\r/g, ' ')

  let html
  if (opts.html) {
    html = opts.html
  } else if (opts.htmlTemplate) {
    html = createContent(opts.htmlTemplate, opts.data)
  }

  let text
  if (opts.text) {
    text = opts.text
  } else if (opts.textTemplate) {
    text = createContent(opts.textTemplate, opts.data)
  }

  if (!html && !text) {
    throw Error('Body content is required (opts.html, opts.htmlTemplate, opts.text, or opts.textTemplate)')
  }

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from,
    to: to.join(','),
    subject,
    text,
    html,
  })

  // console.log('Email result', info)
  return info
}

function createContent(tmpl, data) {
  const hbs = fs.readFileSync('./src/templates/pages/' + tmpl).toString()
  const template = Handlebars.compile(hbs)
  return template(data)
}

function registerPartial(name, file) {
  const hbs = fs.readFileSync('./src/templates/partials/' + file).toString()
  Handlebars.registerPartial(name, hbs)
}

// registerPartial('includes/button', 'includes/button.hbs')
// registerPartial('includes/normal', 'includes/normal.hbs')
// registerPartial('includes/strong', 'includes/strong.hbs')
// registerPartial('includes/title', 'includes/title.hbs')
// registerPartial('layouts/base', 'layouts/base.hbs')

module.exports.createSingleUseToken = async (db, duration, content) => {
  const key = randToken.generate(64)
  await db.query(`
    INSERT INTO single_use_tokens (token, expiry, content)
    VALUES ($1, NOW() + interval '${duration} seconds', $2)
    `, [key, content])
  return key
}

module.exports.consumeSingleUseToken = async (db, key) => {
  return queryForSUT(db, 'DELETE FROM single_use_tokens WHERE token=$1 AND expiry>=NOW() RETURNING expiry, content', key)
}

// module.exports.getSingleUseToken = async (db, key) => {
//   return queryForSUT(db, 'SELECT expiry, content FROM single_use_tokens WHERE token=$1 AND expiry>=NOW()', key)
// }

async function queryForSUT(db, sql, key) {
  const rs = await db.query(sql, [key])
  if (rs.rows.length === 1) {
    return {
      key,
      expiry: rs.rows[0].expiry,
      content: rs.rows[0].content
    }
  }
  return null
}

// function validateRecaptcha(key, recaptchaResponse) {
//   return new Promise((resolve, reject) => {
//     const url = `https://www.google.com/recaptcha/api/siteverify?secret=${key}&response=${recaptchaResponse}`
//     request(url, (err, res, body) => {
//       if (err) {
//         reject(err)
//       } else {
//         const json = JSON.parse(body)
//         resolve(json)
//       }
//     })
//   })
// }
