const inputErrorMessage = 'input-error'

function createInputError(code, message, params) {
  const err = Error(inputErrorMessage)
  err.data = { code, message, params }
  return err
}

function throwInputError(code, message, params) {
  throw createInputError(code, message, params)
}

module.exports = {
  inputErrorMessage,
  tie: throwInputError,
  throwInputError
}
