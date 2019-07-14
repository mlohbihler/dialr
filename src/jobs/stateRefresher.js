/**
 * Creates a cache of data from the database to avoid having to make
 * regular hits for data that should rarely change.
 */
const { jobPipeline, singleInstance, timer } = require('../middleware')

module.exports = async opts => {
  opts.logger.info('Starting state refresher')

  // First, load the state immediately
  await load(opts)

  // Then, refresh the state every 10 seconds (TODO configurable)
  setInterval(() => load(opts), 10000)
}

let lastLoadTime = new Date(0)
const monitor = {
  startTime: null
}

async function load(opts) {
  const { db, logger, state } = opts
  const { accessKeys, experiments, requests } = state

  const singleInstanceFn = singleInstance(`Not executing the state refresher because the instance started at ${monitor.startTime} is still running`, monitor)

  jobPipeline(logger, [singleInstanceFn, timer('stateRefresh')], async () => {
    const min = lastLoadTime
    lastLoadTime = (await db.query('SELECT NOW()')).rows[0].now
    const max = lastLoadTime

    logger.debug(`Loading state since ${min} until ${max}`)

    // Run queries in parallel
    const userPromise = db.query(`
      SELECT u.user_id, u.active AS user_active,
        a.access_key, a.active AS access_key_active
      FROM users u
        LEFT JOIN access_keys a ON u.user_id = a.user_id
      WHERE (u.modified > $1 AND u.modified <= $2)
        OR (a.modified > $1 AND a.modified <= $2)
      `, [min, max])

    const experimentPromise = db.query(`
      SELECT u.user_id, u.active AS user_active,
        e.experiment_id, e.experiment_uuid, e.request_ttl, e.running, e.active AS experiment_active,
        b.branch, b.probability
      FROM users u
        JOIN experiments e ON u.user_id = e.user_id
        LEFT JOIN branches b ON e.experiment_id = b.experiment_id
      WHERE (u.modified > $1 AND u.modified <= $2)
        OR (e.modified > $1 AND e.modified <= $2)
      ORDER BY e.experiment_uuid, b.sort
      `, [min, max])

    // While that's going on, let's dump expired request data.
    for (const [k, e] of Object.entries(requests)) {
      if (e.expiry.getTime() < lastLoadTime.getTime()) {
        logger.info(`Purging request ${k}, expiry=${e.expiry}, now=${lastLoadTime}`)
        delete requests[k]
      }
    }

    // Now we wait until the DB queries are done.
    const results = await Promise.all([userPromise, experimentPromise])

    results[0].rows.forEach(row => {
      if (row.user_active && row.access_key_active) {
        logger.info(`Adding access key ${row.access_key} to user ${row.user_id}`)
        accessKeys[row.access_key] = row.user_id
      } else {
        logger.info(`Removing access key ${row.access_key} from user ${row.user_id}`)
        // If this is slow, use >= node 10. Fast for me, and faster than maps too.
        delete accessKeys[row.access_key]
      }
    })

    const experimentBranches = results[1].rows
    let index = 0
    while (index < experimentBranches.length) {
      // Gather the experiment information from the first row.
      const uuid = experimentBranches[index].experiment_uuid
      const userId = experimentBranches[index].user_id
      const userActive = experimentBranches[index].user_active
      const running = experimentBranches[index].running
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
      if (!userActive) {
        // The user has been deactivated. Delete the entry for it in the experiments map.
        if (experiments[userId]) {
          logger.info(`Removing experiments for user ${userId}`)
          delete experiments[userId]
        }
      } else if (!experimentActive || !running) {
        // The experiment has been turned off or deactivated. Find the entry in the experiments
        // map for the user, and delete the experiment from it.
        const userExperiments = experiments[userId]
        if (userExperiments) {
          if (userExperiments[uuid]) {
            logger.info(`Removing experiment ${uuid}`)
            delete userExperiments[uuid]
          }
        }
      } else {
        logger.info(`Updating experiment ${uuid}`)

        // Ensure the map for the user exists.
        let userExperiments = experiments[userId]
        if (!userExperiments) {
          userExperiments = {}
          experiments[userId] = userExperiments
        }

        // Add or update the experiment data.
        userExperiments[uuid] = experiment
      }
    }
  })
}
