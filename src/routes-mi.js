// TODO track number of hits to experiments

const { tie } = require('./common')
const { ensureExists } = require('./ensure')
const express = require('express')
const { apiPipeline, timer } = require('./middleware')
const { respond } = require('./responses')

const router = express.Router()

router.get('/branch', (req, res) => {
  const { db, logger, state } = req
  const { accessKeys, experiments, requests } = state

  apiPipeline(req, res, [timer('branch')], async () => {
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
      if (!branches.length) {
        tie('branch-6', 'Misconfigured experiment: no branches')
      }
      const rand = Math.floor(Math.random() * experiment.probabilitySum) + 1
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
      if (request.expiry.getTime() > Date.now()) {
        requests[requestKey] = request
        logger.info(`Added request to cache`, request)
      } else {
        logger.info(`Didn't add expired request to cache`, request)
      }
    }

    respond(res, request)

    // Record the hit and do any other post write stuff
    db.query('UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [request.experimentId])
      .catch(err => {
        req.logger.error('Error updating hit count', err)
      })
    // - telemetry send with uuid, rid, branch, outcome, runtime
  })
})

module.exports = router
