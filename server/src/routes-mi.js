/**
 * Copyright Serotonin Software 2019
 */
const branch = require('./mi/branch')
const express = require('express')
const { apiPipeline, timer } = require('./pipeline')

const router = express.Router()

router.get('/branch', (req, res) => apiPipeline(req, res, [timer('branch')], branch.get))

module.exports = router
