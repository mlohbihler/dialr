const { userQuery, getCookie, inputErrorMessage, sessionTokenName, tie, verify } = require('./common')
const { die, error } = require('./responses')

/**
 * This component is only suitable for API pipelines
 */
async function errorHandler(data, next) {
  const { req, res } = data
  try {
    await next()
  } catch (err) {
    if (err.message === inputErrorMessage) {
      error(res, err.data.code, err.data.message, err.data.params)
    } else {
      die(req, res, err)
    }
  }
}

/**
 * This component is suitable for API and job pipelines
 */
function timer(msg) {
  return async (data, next) => {
    const start = Date.now()
    try {
      await next()
    } finally {
      data.logger.info(`${msg} runtime: ${Date.now() - start} ms`)
    }
  }
}

/**
 * This component is only suitable for API pipelines
 *
 * Check for a valid cookie, and if so load the user row as req.user.
 *
 * @param {boolean} require whether the user is required or not. If true and there is no current
 *                          user, a not-authenticated error will be returned to the client.
 * @param {boolean} requireSuperuser whether the user is required to be a superuser or not. If
 *                          true and there is a current user and the current user is not a
 *                          superuser, a not-superuser error will be returned to the client.
 */
function user(require, requireSuperuser) {
  if (require !== true && requireSuperuser === true) {
    throw Error('require must be true if requireSuperuser is true')
  }
  return async (data, next) => {
    const { req } = data
    const { db, headers } = req

    // The session token can be found either as the session token cookie, or as the bearer in the authorization header.
    let token = null
    if (headers && headers.authorization && headers.authorization.indexOf('Bearer ') === 0) {
      token = headers.authorization.substring(7)
    } else {
      token = getCookie(req, sessionTokenName)
      if (token) {
        token = decodeURIComponent(token)
      }
    }

    if (!token) {
      if (require) {
        tie('not-authenticated', 'No session token')
      }
      return next()
    }

    // Validate the token
    const tokenData = verify(token)
    if (!tokenData) {
      if (require) {
        tie('not-authenticated', 'Invalid token')
      }
      return next()
    }

    if (tokenData.expiry < new Date().getTime()) {
      if (require) {
        tie('not-authenticated', 'Token is expired')
      }
      return next()
    }

    // Try to find the user
    const rs = await db.query(`${userQuery} WHERE u.user_id = $1`, [tokenData.userId])

    if (!rs.rows.length) {
      if (require) {
        tie('not-authenticated', 'User record not found')
      }
      return next()
    }

    const user = rs.rows[0]

    // Ensure the user has verified email address
    if (!user.verified) {
      if (require) {
        tie('not-verified', 'User has not verified email address')
      }
      return next()
    }

    if (!user.active) {
      if (require) {
        tie('not-active', 'User is not active')
      }
      return next()
    }

    // TODO add superuser?
    // if (requireSuperuser && !user.is_superuser) {
    //   return reject(createInputError('not-superuser', 'User is not a superuser'))
    // }

    req.user = user

    await next()
  }
}

/**
 * This component is only suitable for API pipelines
 */
async function dbtx(data, next) {
  const { db } = data.req
  try {
    await db.query('BEGIN')
    await next()
    await db.query('COMMIT')
  } catch (err) {
    await db.query('ROLLBACK')
    throw err
  }
}

/**
 * This component is only suitable for job pipelines
 */
function singleInstance(msg, monitorWrapper) {
  return async (data, next) => {
    if (monitorWrapper.startTime) {
      data.logger.warn(msg)
    } else {
      try {
        monitorWrapper.startTime = new Date()
        await next()
      } finally {
        delete monitorWrapper.startTime
      }
    }
  }
}

/**
 * The pipeline to use for UI handlers. Automatically adds the error handler.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Array} comps the list of components to pipeline
 * @param {Function} after the function to run in the middle of the pipeline
 */
async function apiPipeline(req, res, comps, after) {
  comps.splice(0, 0, errorHandler)
  return pipeline({ req, res, logger: req.logger }, comps, after)
}

/**
 * The pipeline to use for UI handlers. Automatically adds the error handler.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Array} comps the list of components to pipeline
 * @param {Function} after the function to run in the middle of the pipeline
 */
async function jobPipeline(logger, comps, after) {
  return pipeline({ logger }, comps, after)
}

/**
 * The basic pipeline.
 *
 * @param {Object} data has of values required by the components
 * @param {Array} comps the list of components to pipeline
 * @param {Function} after the function to run in the middle of the pipeline
 */
async function pipeline(data, comps, after) {
  const next = async () => {
    if (comps.length) {
      const comp = comps.shift()
      if (comp === timer) {
        throw Error(`Don't use the timer function as component. You need to call it with (msg) to configure it into a pipeline component`)
      }
      if (comp === user) {
        throw Error(`Don't use the user function as component. You need to call it with (boolean, boolean) to configure it into a pipeline component`)
      }
      if (comp === singleInstance) {
        throw Error(`Don't use the singleInstance function as component. You need to call it with (string, object) to configure it into a pipeline component`)
      }
      return comp(data, next)
    }
    return after()
  }
  return next()
}

module.exports = {
  apiPipeline,
  dbtx,
  errorHandler,
  jobPipeline,
  singleInstance,
  timer,
  user
}
