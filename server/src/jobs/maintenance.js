/**
 * Copyright Serotonin Software 2019
 *
 * Runs regular database maintenance, including:
 * - deleting users with expired email verifications
 * - deleting expired single use tokens
 * - deleting expired request data
 * - deleting deactivated access key
 * - possibly running database sanity checks
 *
 * It's ok, albeit a bit overkill, if this job runs on all instances of this server.
 */
const { jobPipeline, singleInstance, timer } = require('../pipeline')

module.exports = async opts => {
  opts.logger.info('Starting maintenance')

  // Then, refresh the state every 10 minutes (TODO configurable?)
  // setInterval(() => maintain(opts), 1000 * 60 * 10)
  setInterval(() => maintain(opts), 1000 * 30)
}

const monitor = {
  startTime: null
}

async function maintain(opts) {
  const { db, logger } = opts

  const singleInstanceFn = singleInstance(`Not executing maintenance because the instance started at ${monitor.startTime} is still running`, monitor)

  jobPipeline(logger, [singleInstanceFn, timer('maintenance')], async () => {
    // Delete users whose email verification has expired.
    const verificationPromise = db.query(
      'DELETE FROM users WHERE user_id IN (SELECT user_id FROM email_verifications WHERE expiry < NOW())')

    // Delete expired single use tokens.
    const sutPromise = db.query('DELETE FROM single_use_tokens WHERE expiry < NOW()')

    // Delete deactivated access keys. Give a bit of leeway here, and purge records that expired 10 minutes ago.
    const keysPromise = db.query(`DELETE FROM access_keys WHERE NOT active AND modified < NOW() - interval '10 minutes'`)

    // TODO delete deactivated experiments.

    // Delete expired request data. Give a bit of leeway here, and purge records that expired 10 minutes ago.
    const requestPromise = db.query(`DELETE FROM requests WHERE expiry < NOW() - interval '10 minutes'`)

    // Wait for all of the queries to finish.
    const results = await Promise.all([verificationPromise, sutPromise, keysPromise, requestPromise])

    logger.info(`Maintenance purged ${results[0].rowCount} users, ${results[1].rowCount} SUTs, ${results[2].rowCount} keys, and ${results[3].rowCount} requests`)
  })
}
