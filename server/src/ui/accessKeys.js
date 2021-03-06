/**
 * Copyright Serotonin Software 2019
 */
const { ensureString } = require('../ensure')
const { apiPipeline, user } = require('../pipeline')
const { respond } = require('../responses')
const randToken = require('rand-token')
const { tie } = require('../common')

module.exports.create = (req, res) => {
  apiPipeline(req, res, [user(true)], async () => {
    const { db, user } = req

    const countRs = await db.query('SELECT COUNT(*) FROM access_keys WHERE user_id = $1 AND active', [user.user_id])
    if (countRs.rows[0].count >= user.max_access_keys) {
      tie('accessKeys-create-1', `You already have your maximum number of access keys (${user.max_access_keys})`)
    }

    // Otherwise, create a new key
    const key = randToken.generate(32)
    const insertRs = await db.query('INSERT INTO access_keys (access_key, user_id) VALUES ($1, $2) RETURNING created', [key, user.user_id])

    // Respond
    respond(res, {
      accessKey: key,
      created: insertRs.rows[0].created,
      lastUsed: null
    })
  })
}

module.exports.list = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    // Retrieve the access keys from the database. Don't use the app state since
    // that takes a moment to update.
    const rs = await req.db.query('SELECT access_key, created, last_used FROM access_keys WHERE user_id = $1 AND active', [req.user.user_id])
    respond(res, { accessKeys: rs.rows.map(row => ({
      accessKey: row.access_key,
      created: row.created,
      lastUsed: row.last_used
    })) })
  })
}

module.exports.remove = (req, res) => {
  apiPipeline(req, res, [user()], async () => {
    const key = ensureString(req.params.key, 'accessKeys-remove-1', 'key is missing or invalid')
    const rs = await req.db.query(`
      UPDATE access_keys SET active = false, modified = NOW()
      WHERE access_key = $1 AND active
      `, [key])
    if (rs.rowCount === 0) {
      tie('accessKeys-remove-2', 'Access key was not found')
    }
    respond(res)
  })
}
