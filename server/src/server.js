/**
 * Copyright Serotonin Software 2019
 */
const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const http = require('http')
const https = require('https')
const morgan = require('morgan')
const path = require('path')
const maintenance = require('./jobs/maintenance')
const RateLimit = require('express-rate-limit')
const { errorObject } = require('./responses')
const rfs = require('rotating-file-stream')
const stateRefresher = require('./jobs/stateRefresher')
const mi = require('./routes-mi')
const ui = require('./routes-ui')

module.exports = options => {
  const { db, logger } = options

  // Create and configure the server
  const app = express()

  options.state = {
    accessKeys: {}, // Map of access key to client id
    experiments: {}, // Map client id to map of experiment uuid to experiment data
    requests: {} // Map of { experiment id, request id } to results
  }

  // Start jobs
  stateRefresher(options)
  maintenance(options)

  // // Assume that we're behind a load balancer.
  // app.set('trust proxy', true)

  // Prevent referer headers in subsequent requests.
  app.use(helmet.referrerPolicy({ policy: 'origin' }))

  app.use(helmet())
  app.use(compression())
  app.use(bodyParser.json())

  // CORS: enable cross domain request handling.
  if (process.env.NODE_ENV === 'production') {
    // ... unless we're in production. No need for it here.
    logger.info('Starting production instance, no CORS')
  } else {
    logger.info('Enabling CORS')
    app.use(function(req, res, next) {
      res.set({
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Accept,Cache-Control,Content-Type,Cookie,Origin,X-Content-Type,X-Requested-With,X-XSRF-Token',
        'Access-Control-Allow-Methods': 'DELETE,GET,OPTIONS,POST,PUT,PATCH'
      })
      next()
    })
  }

  // Rate limiting
  app.use('/api/', new RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
  }))

  // Logging
  const logDirectory = path.join(__dirname, '../logs')
  // Ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
  // Create a rotating write stream
  const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  })
  // Setup the logger
  app.use(morgan('combined', { stream: accessLogStream }))

  // Middleware to inject the database and error log into the request object.
  app.use((req, res, next) => {
    req.db = db
    req.logger = logger
    req.state = options.state
    next()
  })

  // Set the routes
  app.use('/mi', mi)
  app.use('/ui', ui)
  app.use(express.static('static'))
  app.get('*', (req, res, next) => {
    // Route requests for specific URLs to the index.html file if they were requested
    // as text/html. This allows for initial requests for URLs like '/about' and '/register'
    // to make it to the client. Otherwise they would be 404s.
    if (req.headers.accept && req.headers.accept.indexOf('text/html') > -1) {
      // Path names have to be absolute.
      res.sendFile(path.join(__dirname, '..', 'static', 'index.html'))
    } else {
      next()
    }
  })
  app.use((req, res) => res.status(404).send(errorObject('not-found', req.originalUrl + ' not found')))

  // Start HTTP the listener
  const httpServer = http.createServer(app)
  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    // Confirm that the server started ok
    logger.info(`DiaLR HTTP server started on: ${port}`)
  })

  // Certificates
  try {
    const credentials = {
      key: fs.readFileSync('certs/privkey.pem', 'utf8'),
      cert: fs.readFileSync('certs/cert.pem', 'utf8'),
      ca: fs.readFileSync('certs/chain.pem', 'utf8')
    }

    const httpsServer = https.createServer(credentials, app)
    const sslPort = process.env.SSL_PORT || 3443
    httpsServer.listen(sslPort, () => {
      logger.info(`DiaLR HTTPS server started on: ${sslPort}`)
    })
  } catch (err) {
    logger.info('DiaLR HTTPS server not started')
  }
}
