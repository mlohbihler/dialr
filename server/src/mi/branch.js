/**
 * Copyright Serotonin Software 2019
 *
 * This is the machine interface (MI). Requests are made from your code to this
 * interface to determine what branch should be followed. This is as opposed to
 * the UI interface, which is used by the VueJS client to provide the
 * admin console for system configuration.
 *
 * Requests use the GET method to avoid having to make preflight requests since
 * it is possible that requests can be made from a UI served from a different
 * domain, and therefore would be subject to CORS restrictions.
 *
 * This endpoint requires the use of an access key provided by the
 * `x-access-key` header. Access keys are provisioned using the `/access-keys`
 * endpoint in the UI routes.
 *
 * Parameters are as follows:
 * - `uuid`: the ID of the experiment, provisioned using the `/experiments`
 *           endpoint in the UI routes. This parameter is required.
 * - `rid`: the request id. This value allows multiple requests to this
 *          interface to result in the same response value. It is a required
 *          parameter even if your code only makes a single call to this
 *          interface per request.
 * - `outcome`: this parameter is optional. It can be used to track the outcome
 *              of a particular request (error messages, return values, etc).
 */
const { tie } = require('../common')
const { ensureExists } = require('../ensure')
const { now, random } = require('../indeterminant')
const { respond } = require('../responses')

module.exports.get = async (req, res) => {
  const { db, logger, state } = req
  const { accessKeys, experiments, requests } = state

  const accessKey = ensureExists(req.headers['x-access-key'], 'branch-1', 'accessKey empty or not provided')
  const userId = ensureExists(accessKeys[accessKey], 'branch-2', 'Invalid accessKey')
  const experimentUuid = ensureExists(req.query.uuid, 'branch-3', 'uuid empty or not provided')
  const requestId = ensureExists(req.query.rid, 'branch-4', 'rid (request id) empty or not provided')
  const outcome = req.query.outcome
  let experiment

  // Check if the request already exists
  const requestKey = experimentUuid + '$$$$' + requestId
  let request = requests[requestKey]
  if (request) {
    logger.info('Branch cache hit')
  } else {
    logger.info('Branch cache miss')

    // Didn't find the request locally. Find the experiment.
    const userExperiments = ensureExists(experiments[userId], 'branch-5', 'Invalid uuid')
    experiment = ensureExists(userExperiments[experimentUuid], 'branch-5', 'Invalid uuid')

    // Pick a branch from the experiment.
    const { branches } = experiment
    if (!branches || !branches.length) {
      tie('branch-6', 'Misconfigured experiment: no branches')
    }
    const rand = Math.floor(random() * experiment.probabilitySum) + 1
    // TODO could also use a hash of the requestId as the rand, which would make
    // the branch more deterministic for the client code.
    let branch
    let sum = 0
    let index = 0
    while (rand > sum && index < branches.length) {
      branch = branches[index++]
      sum += branch.probability
    }

    // Check the database for the request.
    const rs = await db.query(`
      INSERT INTO requests (experiment_id, request_id, branch, expiry, outcome)
        VALUES ($1, $2, $3, NOW() + ($4 || ' SECONDS')::INTERVAL, $5)
      ON CONFLICT ON CONSTRAINT requests_pkey
        DO UPDATE SET outcome = $5
      RETURNING branch, expiry
    `, [experiment.experimentId, requestId, branch.value, experiment.ttl, outcome])

    request = {
      branch: rs.rows[0].branch,
      expiry: rs.rows[0].expiry,
      experimentId: experiment.experimentId
    }

    // Add to the cache if the request is not already expired
    if (request.expiry.getTime() > now()) {
      requests[requestKey] = request
      logger.info(`Added request to cache`, request)
    } else {
      logger.info(`Didn't add expired request to cache`, request)
    }
  }

  respond(res, { branch: request.branch, expiry: request.expiry })

  // Record the hit and do any other post write stuff. This is all done in parallel
  logError(logger,
    db.query('UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [request.experimentId]),
    'Error updating experiment hit count')
  logError(logger,
    db.query('UPDATE access_keys SET last_used=NOW() WHERE access_key = $1', [accessKey]),
    'Error updating access key last used')
  logError(logger,
    db.query('UPDATE branches SET last_used=NOW() WHERE experiment_id = $1 AND branch = $2', [request.experimentId, request.branch]),
    'Error updating branch last used')
  // - telemetry send with uuid, rid, branch, outcome, runtime
}

function logError(logger, promise, msg) {
  promise.catch(err => logger.error(msg, err))
}