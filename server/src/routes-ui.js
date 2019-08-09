/**
 * Copyright Serotonin Software 2019
 */
const express = require('express')

const accessKeys = require('./ui/accessKeys')
const experiments = require('./ui/experiments')
const session = require('./ui/session')
const user = require('./ui/user')

const router = express.Router()

router.post('/access-keys', accessKeys.create)
router.get('/access-keys', accessKeys.list)
router.delete('/access-keys', accessKeys.remove)

router.post('/experiments', experiments.create)
router.get('/experiments', experiments.list)
router.put('/experiments', experiments.update)
router.delete('/experiments', experiments.remove)

router.get('/session', session.getCurrentUser)
router.post('/session', session.login)
router.post('/session/gtoken', session.glogin)
router.delete('/session', session.logout)

router.post('/user', user.register)
router.post('/user/activate-registration', user.activateRegistration)
router.post('/user/resend-verification-email', user.resendVerificationEmail)
router.post('/user/request-password-reset', user.requestPasswordReset)
router.post('/user/reset-password', user.resetPassword)

module.exports = router
