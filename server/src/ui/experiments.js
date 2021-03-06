/**
 * Copyright Serotonin Software 2019
 */
const { compileExpression } = require('filtrex')
const { ensureArray, ensureBoolean, ensureInteger, ensureOptionalString, ensureString, ensureStringLength } = require('../ensure')
const { apiPipeline, dbtx, user } = require('../pipeline')
const { respond } = require('../responses')
const { nullOrUndefined, tie } = require('../common')
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

    await updateBranches(experimentId, body.branches, db)

    // Reselect the experiment and return
    const experiments = await experimentQuery(db, user.user_id, experimentId)
    respond(res, experiments[0])
  })
}

module.exports.list = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const { db, user } = req
    const experiments = await experimentQuery(db, user.user_id)
    respond(res, { experiments })
  })
}

module.exports.get = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const { db, user } = req
    const experiments = await experimentQuery(db, user.user_id, null, req.params.uuid)
    respond(res, experiments.length ? experiments[0] : null)
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

    await updateBranches(experimentId, body.branches, db)

    // Reselect the experiment and return
    const experiments = await experimentQuery(db, user.user_id, experimentId)
    respond(res, experiments[0])
  })
}

module.exports.remove = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const uuid = ensureString(req.params.uuid, 'experiments-remove-1', 'uuid is missing or invalid')
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
  const requestTtl = ensureInteger(body.requestTtl, 'experiments-upsert-3', `Missing or invalid 'requestTtl'`)
  ensureBoolean(body.running, 'experiments-upsert-4', `Missing or invalid 'running'`)

  ensureStringLength(title, 1, 32, 'experiments-upsert-5', `'title' must be 1-32 characters`)
  ensureStringLength(description, 0, 1000, 'experiments-upsert-6', `'description' cannot be longer than 1000 characters`)
  if (requestTtl > 60 * 10) {
    tie('experiments-upsert-7', `'requestTtl' cannot be greater than 600 (10 minutes)`)
  }

  const branches = ensureArray(body.branches, 'experiments-upsert-8', `Missing or invalid 'branches'`)
  if (branches.length < 1 || branches.length > user.max_branches) {
    tie('experiments-upsert-9', `An experiment must have at least 1 branch, and not more than your maximum of ${user.max_branches}`)
  }
  const valueSet = new Set()
  let unfiltered = false
  branches.forEach(branch => {
    ensureString(branch.value, 'experiments-upsert-10', `Missing or invalid 'branch.value'`)
    ensureStringLength(branch.value, 1, 10, 'experiments-upsert-11', `'branch.value' must be 1-10 characters`)
    ensureInteger(branch.probability, 'experiments-upsert-12', `Missing or invalid 'branch.probability'`)
    ensureOptionalString(branch.filter, 'experiments-upsert-16', `Invalid 'branch.filter'`)

    if (branch.probability < 0) {
      tie('experiments-upsert-13', `'branch.probability' must be >= 0`)
    }
    valueSet.add(branch.value)

    if (branch.filter && branch.filter.trim()) {
      try {
        compileExpression(branch.filter)
      } catch (err) {
        tie('experiments-upsert-17', err.message)
      }
    } else {
      unfiltered = true
    }
  })
  if (valueSet.size !== branches.length) {
    tie('experiments-upsert-14', `All branch values must be unique`)
  }
  if (!unfiltered) {
    tie('experiments-upsert-15', `You must include an unfiltered branch`)
  }
}

async function updateBranches(experimentId, branches, db) {
  // Upsert the branches
  const upsertParams = []
  const upsertValues = []
  const deleteParams = [experimentId]
  const deleteValues = []
  branches.forEach((branch, index) => {
    upsertParams.push(experimentId)
    upsertParams.push(branch.value)
    upsertParams.push(branch.probability)
    upsertParams.push((branch.filter && branch.filter.trim()) || null)
    upsertValues.push(`($${index * 4 + 1},$${index * 4 + 2},$${index * 4 + 3},$${index * 4 + 4})`)

    deleteParams.push(branch.value)
    deleteValues.push(`$${index + 2}`)
  })
  await db.query(`
    INSERT INTO branches (experiment_id, branch, probability, filter) VALUES ${upsertValues}
    ON CONFLICT (experiment_id, branch) DO UPDATE
      SET probability = excluded.probability, filter = excluded.filter
    `, upsertParams)

  // Delete other branches
  await db.query(`DELETE FROM branches WHERE experiment_id = $1 AND branch NOT IN (${deleteValues})`, deleteParams)
}

async function experimentQuery(db, userId, experimentId, uuid) {
  // Retrieve experiments from the database. Don't use the app state since
  // that takes a moment to update.
  const params = [userId]
  if (!nullOrUndefined(experimentId)) {
    params.push(experimentId)
  } else if (!nullOrUndefined(uuid)) {
    params.push(uuid)
  }
  const rs = await db.query(`
    SELECT e.experiment_uuid, e.title, e.description, e.request_ttl, e.running, e.hits,
      b.branch, b.probability, b.last_used, b.filter
    FROM experiments e
      LEFT JOIN branches b ON e.experiment_id = b.experiment_id
    WHERE e.user_id = $1
      AND e.active
      ${nullOrUndefined(experimentId) ? '' : 'AND e.experiment_id = $2'}
      ${nullOrUndefined(uuid) ? '' : 'AND e.experiment_uuid = $2'}
    ORDER BY e.experiment_uuid, b.branch
    `, params)

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
      hits: rows[index].hits,
      branches: []
    }
    experiments.push(experiment)

    // Iterate over all the branches
    while (index < rows.length && experiment.uuid === rows[index].experiment_uuid) {
      experiment.branches.push({
        value: rows[index].branch,
        probability: rows[index].probability,
        lastUsed: rows[index].last_used,
        filter: rows[index].filter
      })
      index++
    }
  }

  return experiments
}
