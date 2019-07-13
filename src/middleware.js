const { inputErrorMessage } = require('./common')
const { die, error } = require('./responses')

async function errorHandler(req, res, cb) {
  try {
    await cb()
  } catch (err) {
    if (err.message === inputErrorMessage) {
      error(res, err.data.code, err.data.message, err.data.params)
    } else {
      die(req, res, err)
    }
  }
}

async function runtimeTimer(logger, msg, cb) {
  const start = Date.now()
  try {
    await cb()
  } finally {
    logger.info(`${msg}: ${Date.now() - start} ms`)
  }
}

module.exports = {
  errorHandler,
  runtimeTimer
}
