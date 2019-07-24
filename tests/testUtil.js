// const chain = require('../src/chain')
// const responses = require('../src/responses')

// jest.mock('../src/chain')
// jest.mock('../src/responses')

/**
 * Provides a mock of the pipeline calls in handlers and jobs.
 *
 * @param {Function} ut the function under test
 * @param {Object} opts can contain:
 *                   - headers: the request headers
 *                   - body: the request body
 *                   - query: the query function for the db object
 *                   - user: the current user
 *                   - failOnThen: ensures that tests that are intended to fail do so if 'then' is called. Set to false if the test should succeed
 *                   - connection: request connection attributes
 *                   - queryString: the query string of the request
 */
module.exports.context = (ut, opts = {}) => {
//   const req = {}
//   req.headers = opts.headers || {}
//   req.body = opts.body || {}
//   req.db = { query: opts.query }
//   req.ip = opts.ip
//   req.query = opts.queryString || {}

//   const res = {}

//   // This may not be the right place to do this, but it does provide a consistent value for all of the tests.
//   process.env.SECRET_KEY = 'test-secret'

//   const prom = new Promise((resolve, reject) => {
//     const cookies = []

//     chain.user.mockImplementation((require, requireSuper) => function() { req.user = opts.user })
//     chain.chain.mockImplementation((req, res, links, after) => {
//       if (links) {
//         links.forEach(link => link())
//       }
//       return after()
//         .catch(err => reject(err))
//     })

//     responses.respond.mockImplementation((res, body) => resolve({ body, cookies }))
//     res.cookie = (key, value, opts) => cookies.push({ key, value, opts })
//     res.redirect = (location) => resolve({ redirect: location, cookies })

//     return ut(req, res)
//   })

//   if (opts.failOnThen !== false) {
//     return prom.then(() => {
//       throw Error('Should not have reached "then"')
//     })
//   }
//   return prom
}

module.exports.expectErrorCode = async (code, ut) => {
  try {
    await ut()
    throw Error(`Expected error with code '${code}' to have been thrown`)
  } catch (err) {
    if (!err.data) {
      throw Error('Error did not have data attribute: message=' + err.message)
    }
    expect(err.data.code).toEqual(code)
  }
}
