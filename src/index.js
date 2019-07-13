// Configuration
require('dotenv').config()

// Import
const { Pool } = require('pg')
const { createLogger, format, transports } = require('winston')

// Logging
const logger = createLogger({
  level: 'info',
  // format: format.json(),
  format: format.combine(
    format.errors({ stack: true }),
    format.colorize({ colors: { info: 'blue', warn: 'yellow', error: 'red' } }),
    format.timestamp(),
    format.simple(),
  ),
  // defaultMeta: { service: 'dialr' },
  transports: [
    new transports.Console(),
    // new transports.File({ filename: 'dialr.log' })
  ]
})

logger.info('Dialr starting...')
const migrateAndStart = require('pg-migration')['default']({
  log: (level, message) => {
    if (level === 'debug') {
      logger.debug(message)
    } else if (level === 'info') {
      logger.info(message)
    } else if (level === 'warning') {
      logger.warn(message)
    } else if (level === 'error') {
      logger.error(message)
    }
  }
})

// Connect to the database
const db = new Pool()
db.on('error', err => logger.error('Error in connection pool', err))

const go = async () => {
  // Migrate the database if necessary.
  logger.info('Migration started')
  await new Promise((resolve, reject) => migrateAndStart(db, './sql', err => {
    if (err) {
      reject(err)
    } else {
      logger.info('Migration finished')
      resolve()
    }
  }))
    .then(() => {
      require('./server')({ db, logger })
    })
    .catch(err => {
      logger.error(err)
    })
}
go()
