const { ensureArray, ensureBoolean, ensureNumber, ensureString, ensureStringLength } = require('../ensure')
const { apiPipeline, dbtx, user } = require('../middleware')
const { respond } = require('../responses')
const { tie } = require('../common')
const uuidv4 = require('uuid/v4')

module.exports.create = (req, res) => {
  apiPipeline(req, res, [user(true), dbtx], async () => {
    const { db, user, body } = req

    const countRs = await db.query('SELECT COUNT(*) FROM experiments WHERE user_id = $1 AND active', [user.user_id])
    if (countRs.rows[0].count >= user.max_experiments) {
      tie('experiments-create-1', `You already have your maximum number of experiments (${user.max_experiments})`)
    }

    validateExperimentInput(req.user, body)

    // Create the new experiment
    const uuid = uuidv4()
    const experimentRs = await db.query(`
      INSERT INTO experiments (user_id, experiment_uuid, title, description, request_ttl, running)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING experiment_id
      `, [user.user_id, uuid, body.title, body.description, body.requestTtl, body.running])

    const experimentId = experimentRs.rows[0].experiment_id

    await insertBranches(experimentId, body.branches, db)

    sendUpsertResponse(res, uuid, body)
  })
}

module.exports.list = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const { db, user } = req

    // Retrieve experiments from the database. Don't use the app state since
    // that takes a moment to update.
    const rs = await db.query(`
      SELECT e.experiment_uuid, e.title, e.description, e.request_ttl, e.running,
        b.branch, b.probability
      FROM experiments e
        LEFT JOIN branches b ON e.experiment_id = b.experiment_id
      WHERE e.user_id = $1 AND e.active
      ORDER BY e.experiment_uuid, b.sort
      `, [user.user_id])

    // Convert the table of results into experiment objects
    const { rows } = rs
    const experiments = []
    let index = 0
    while (index < rows.length) {
      // Gather the experiment information from the first row.
      const experiment = {
        uuid: rows[index].experiment_uuid,
        title: rows[index].title,
        description: rows[index].description,
        requestTtl: rows[index].request_ttl,
        running: rows[index].running,
        branches: []
      }
      experiments.push(experiment)

      // Iterate over all the branches
      while (index < rows.length && experiment.uuid === rows[index].experiment_uuid) {
        experiment.branches.push({
          value: rows[index].branch,
          probability: rows[index].probability
        })
        index++
      }
    }

    respond(res, { experiments })
  })
}

module.exports.update = (req, res) => {
  apiPipeline(req, res, [user(true), dbtx], async () => {
    const { db, user, body } = req

    const uuid = ensureString(body.uuid, 'experiments-update-1', `Missing or invalid 'uuid'`)

    validateExperimentInput(req.user, body)

    // Save the experiment
    const experimentRs = await db.query(`
      UPDATE experiments SET title = $1, description = $2, request_ttl = $3, running = $4, modified = NOW()
      WHERE experiment_uuid = $5
        AND user_id = $6
      RETURNING experiment_id
      `, [body.title, body.description, body.requestTtl, body.running, uuid, user.user_id])

    const experimentId = experimentRs.rows[0].experiment_id

    // Delete all exising branches.
    await db.query('DELETE FROM branches WHERE experiment_id = $1', [experimentId])

    await insertBranches(experimentId, body.branches, db)

    sendUpsertResponse(res, uuid, body)
  })
}

module.exports.remove = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const uuid = ensureString(req.query.uuid, 'experiments-remove-1', 'uuid is missing or invalid')
    const rs = await req.db.query(`
      UPDATE experiments SET active = false, modified = NOW()
      WHERE experiment_uuid = $1 AND active
      `, [uuid])
    if (rs.rowCount === 0) {
      tie('experiments-remove-2', 'Experiment was not found')
    }
    respond(res)
  })
}

function validateExperimentInput(user, body) {
  // Validate the given object.
  const title = ensureString(body.title, 'experiments-upsert-1', `Missing or invalid 'title'`)
  const description = ensureString(body.description, 'experiments-upsert-2', `Missing or invalid 'description'`)
  const requestTtl = ensureNumber(body.requestTtl, 'experiments-upsert-3', `Missing or invalid 'requestTtl'`)
  ensureBoolean(body.running, 'experiments-upsert-4', `Missing or invalid 'running'`)

  ensureStringLength(title, 1, 32, 'experiments-upsert-5', `'title' must be 1-32 characters`)
  ensureStringLength(description, 0, 1000, 'experiments-upsert-6', `'description' cannot be longer than 1000 characters`)
  if (requestTtl > 60 * 10) {
    tie('experiments-upsert-7', `'requestTtl' cannot be greater than 600 (10 minutes)`)
  }

  const branches = ensureArray(body.branches, 'experiments-upsert-8', `Missing or invalid 'branches'`)
  if (branches.length < 2 || branches.length > user.max_branches) {
    tie('experiments-upsert-9', `An experiment must have at least 2 branches, and not more than your maximum of ${user.max_branches}`)
  }
  const valueSet = new Set()
  branches.forEach(branch => {
    ensureString(branch.value, 'experiments-upsert-10', `Missing or invalid 'branch.value'`)
    ensureStringLength(branch.value, 1, 10, 'experiments-upsert-11', `'branch.value' must be 1-10 characters`)
    ensureNumber(branch.probability, 'experiments-upsert-12', `Missing or invalid 'branch.probability'`)
    if (branch.probability < 1) {
      tie('experiments-upsert-13', `'branch.probability' must be greater than 0`)
    }
    valueSet.add(branch.value)
  })
  if (valueSet.size !== branches.length) {
    tie('experiments-upsert-14', `All branch values must be unique`)
  }
}

async function insertBranches(experimentId, branches, db) {
  // Insert the branches
  const params = []
  const values = []
  branches.forEach((branch, index) => {
    params.push(experimentId)
    params.push(branch.value)
    params.push(branch.probability)
    params.push(index)
    values.push(`($${index * 4 + 1},$${index * 4 + 2},$${index * 4 + 3},$${index * 4 + 4})`)
  })
  await db.query(`INSERT INTO branches (experiment_id, branch, probability, sort) VALUES ${values}`, params)
}

function sendUpsertResponse(res, uuid, body) {
  // Respond. Don't use a body spread here because we don't want to include any
  // extra data that might have been put there.
  respond(res, {
    uuid,
    title: body.title,
    description: body.description,
    requestTtl: body.requestTtl,
    running: body.running,
    branches: body.branches.map(branch => ({
      value: branch.value,
      probability: branch.probability
    }))
  })
}
