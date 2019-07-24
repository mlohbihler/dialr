/**
 * Copyright Matthew Lohbihler 2019
 *
 * This module wraps a number of indeterminant functions so that they can be
 * mocked easily.
 */
module.exports.random = () => {
  return Math.random()
}

module.exports.now = () => {
  return Date.now()
}
