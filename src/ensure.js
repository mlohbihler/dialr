const { tie } = require('./common')

function ensureExists(value, code, message) {
  if (!value) {
    tie(code, message)
  }
  return value
}

module.exports = {
  ensureExists
}
