/**
 * Copyright Matthew Lohbihler 2019
 */
const { sendEmail } = require('./remote')

function die(req, res, err) {
  req.logger.error(err)
  const msg = process.env.NODE_ENV === 'production' ? 'Uh oh, internal server error' : err.message
  res.status(500).json(errorObject('server-error', msg))

  if (process.env.NODE_ENV !== 'development') {
    sendEmail({
      to: process.env.startupEmailTo,
      subject: 'Dialr error',
      text: err.stack
    })
  }
}

function error(res, code, message, params) {
  res.status(400).json(errorObject(code, message, params))
}

function respond(res, data) {
  res.json(arguments.length === 1 ? {} : data)
}

function errorObject(code, message, params) {
  return { error: { code, message, params } }
}

module.exports = {
  die,
  error,
  errorObject,
  respond
}
