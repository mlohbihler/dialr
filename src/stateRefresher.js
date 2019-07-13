const { runtimeTimer } = require('./middleware')

module.exports = async opts => {
  opts.logger.info('Starting state refresher')

  // First, load the state immediately
  await load(opts)

  // Then, refresh the state every 10 seconds (TODO configurable)
  setInterval(() => load(opts), 10000)
}

let lastLoadTime = new Date(0)
let startTime

async function singleInstance(logger, cb) {
  if (startTime) {
    logger.warn(`Not executing the state refresher because the instance started at ${startTime} is still running`)
  } else {
    try {
      startTime = new Date()
      await cb()
    } finally {
      startTime = null
    }
  }
}

async function load(opts) {
  const { db, logger, state } = opts
  const { accessKeys, experiments, requests } = state

  singleInstance(logger, async () => {
    await runtimeTimer(logger, 'stateRefresh', async () => {
      const min = lastLoadTime
      lastLoadTime = (await db.query('SELECT NOW()')).rows[0].now
      const max = lastLoadTime

      logger.debug(`Loading state since ${min} until ${max}`)

      // Run queries in parallel
      const clientPromise = db.query(`
        SELECT c.client_id, c.active AS client_active,
          a.access_key, a.active AS access_key_active
        FROM clients c
          LEFT JOIN access_keys a ON c.client_id = a.client_id
        WHERE (c.modified > $1 AND c.modified <= $2)
          OR (a.modified > $1 AND a.modified <= $2)
        `, [min, max])

      const experimentPromise = db.query(`
        SELECT c.client_id, c.active AS client_active,
          e.experiment_id, e.experiment_uuid, e.request_ttl, e.active AS experiment_active,
          b.branch, b.probability
        FROM clients c
          JOIN experiments e ON c.client_id = e.client_id
          LEFT JOIN branches b ON e.experiment_id = b.experiment_id
        WHERE (c.modified > $1 AND c.modified <= $2)
          OR (e.modified > $1 AND e.modified <= $2)
        ORDER BY e.experiment_uuid, b.sort
        `, [min, max])

      // While that's goind on, let's dump expired request data.
      for (const [k, e] of Object.entries(requests)) {
        if (e.expiry.getTime() < lastLoadTime.getTime()) {
          logger.info(`Purging request ${k}, expiry=${e.expiry}, now=${lastLoadTime}`)
          delete requests[k]
        }
      }

      // Now we wait until the DB queries are done.
      const results = await Promise.all([clientPromise, experimentPromise])

      results[0].rows.forEach(row => {
        if (row.client_active && row.access_key_active) {
          logger.info(`Adding access key ${row.access_key} to client ${row.client_id}`)
          accessKeys[row.access_key] = row.client_id
        } else {
          logger.info(`Removing access key ${row.access_key} from client ${row.client_id}`)
          // If this is slow, use >= node 10. Fast for me, and faster than maps too.
          delete accessKeys[row.access_key]
        }
      })

      const experimentBranches = results[1].rows
      let index = 0
      while (index < experimentBranches.length) {
        // Gather the experiment information from the first row.
        const uuid = experimentBranches[index].experiment_uuid
        const clientId = experimentBranches[index].client_id
        const clientActive = experimentBranches[index].client_active
        const experimentActive = experimentBranches[index].experiment_active
        const experiment = {
          experimentId: experimentBranches[index].experiment_id,
          ttl: experimentBranches[index].request_ttl,
          branches: [],
          probabilitySum: 0
        }

        // Iterate over all the branches
        while (index < experimentBranches.length && uuid === experimentBranches[index].experiment_uuid) {
          experiment.branches.push({
            value: experimentBranches[index].branch,
            probability: experimentBranches[index].probability
          })
          experiment.probabilitySum += experimentBranches[index].probability
          index++
        }

        // Handle the loaded data.
        if (!clientActive) {
          // The client has been deactivated. Delete the entry for it in the experiments map.
          if (experiments[clientId]) {
            logger.info(`Removing experiments for client ${clientId}`)
            delete experiments[clientId]
          }
        } else if (!experimentActive) {
          // The experiment has been deactivated. Find the entry in the experiments map for the
          // client, and delete the experiment from it.
          const clientExperiments = experiments[clientId]
          if (clientExperiments) {
            if (clientExperiments[uuid]) {
              logger.info(`Removing experiment ${uuid}`)
              delete clientExperiments[uuid]
            }
          }
        } else {
          logger.info(`Updating experiment ${uuid}`)

          // Ensure the map for the client exists.
          let clientExperiments = experiments[clientId]
          if (!clientExperiments) {
            clientExperiments = {}
            experiments[clientId] = clientExperiments
          }

          // Add or update the experiment data.
          clientExperiments[uuid] = experiment
        }
      }
    })
  })
}
