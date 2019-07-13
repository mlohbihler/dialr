const { tie } = require('./common')
const { ensureExists } = require('./ensure')
const express = require('express')
const { errorHandler, runtimeTimer } = require('./middleware')
const { respond } = require('./responses')

const router = express.Router()

router.get('/branch', (req, res) => {
  const { db, logger, state } = req
  const { accessKeys, experiments, requests } = state

  runtimeTimer(logger, 'branch', async () => {
    errorHandler(req, res, async () => {
      const accessKey = ensureExists(req.headers['x-access-key'], 'branch-1', 'accessKey empty or not provided')
      const clientId = ensureExists(accessKeys[accessKey], 'branch-2', 'invalid accessKey')
      const experimentUuid = ensureExists(req.query.xid, 'branch-3', 'xid (experiment id) empty or not provided')
      const requestId = ensureExists(req.query.rid, 'branch-4', 'rid (request id) empty or not provided')
      const outcome = req.query.outcome

      // Check if the request already exists
      const requestKey = experimentUuid + '$$$$' + requestId
      let request = requests[requestKey]
      if (request) {
        logger.info('Branch cache hit')
      } else {
        logger.info('Branch cache miss')

        // Didn't find the request locally. Find the experiment.
        const clientExperiments = ensureExists(experiments[clientId], 'branch-5', 'invalid xid (experiment id)')
        const experiment = ensureExists(clientExperiments[experimentUuid], 'branch-5', 'invalid xid (experiment id)')

        // Pick a branch from the experiment.
        const { branches } = experiment
        if (!branches.length) {
          tie('branch-6', 'Misconfigured experiment: no branches')
        }
        const rand = Math.floor(Math.random() * experiment.probabilitySum)
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
          expiry: rs.rows[0].expiry
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

      // TODO add some post write stuff
      // - telemetry send with xid, rid, branch, runtime
    })
  })
})

module.exports = router
