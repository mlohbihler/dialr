const indeterminant = require('../../src/indeterminant')
const responses = require('../../src/responses')
const { expectErrorCode } = require('../testUtil')

jest.mock('../../src/indeterminant')
jest.mock('../../src/responses')

indeterminant.now = jest.fn()
indeterminant.random = jest.fn()

let responseBody
responses.respond.mockImplementation((res, body) => { responseBody = body })

let query = jest.fn()
const queryCatch = jest.fn()

const mut = require('../../src/mi/branch')

beforeEach(() => {
  query = jest.fn()

  indeterminant.now.mockReset()
  indeterminant.random.mockReset()
  queryCatch.mockReset()

  query.mockReturnValue(Promise.resolve())
})

describe('get', () => {
  const ut = mut.get

  it('complains that the access key missing', async () => {
    return expectErrorCode('branch-1', async () => {
      await ut({
        headers: {},
        state: {}
      })
    })
  })

  it('complains that the access key is invalid', async () => {
    return expectErrorCode('branch-2', async () => {
      await ut({
        headers: { 'x-access-key': 'test-access-key' },
        state: {
          accessKeys: {}
        }
      })
    })
  })

  it('complains that the uuid is missing', async () => {
    return expectErrorCode('branch-3', async () => {
      await ut({
        headers: { 'x-access-key': 'test-access-key' },
        query: {},
        state: {
          accessKeys: { 'test-access-key': 12 }
        }
      })
    })
  })

  it('complains that the require id is missing', async () => {
    return expectErrorCode('branch-4', async () => {
      await ut({
        headers: { 'x-access-key': 'test-access-key' },
        query: { uuid: 'test-uuid' },
        state: {
          accessKeys: { 'test-access-key': 12 }
        }
      })
    })
  })

  it('success with cache hit', async () => {
    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error: jest.fn() },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        requests: { 'test-uuid$$$$test-rid': { branch: 'A', expiry: 'expiry', experimentId: 123 } }
      }
    })

    expect(responseBody).toEqual({ branch: 'A', expiry: 'expiry' })
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenCalledWith('UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [123])
    expect(queryCatch).toHaveBeenCalledTimes(0)
  })

  it('complains that the uuid is invalid 1', async () => {
    return expectErrorCode('branch-5', async () => {
      await ut({
        db: { query },
        headers: { 'x-access-key': 'test-access-key' },
        logger: { info: jest.fn(), error: jest.fn() },
        query: { uuid: 'test-uuid', rid: 'test-rid' },
        state: {
          accessKeys: { 'test-access-key': 12 },
          experiments: {},
          requests: { 'test-uuid$$$$test-otherRid': { experimentId: 123 } }
        }
      })
    })
  })

  it('complains that the uuid is invalid 2', async () => {
    return expectErrorCode('branch-5', async () => {
      await ut({
        db: { query },
        headers: { 'x-access-key': 'test-access-key' },
        logger: { info: jest.fn(), error: jest.fn() },
        query: { uuid: 'test-uuid', rid: 'test-rid' },
        state: {
          accessKeys: { 'test-access-key': 12 },
          experiments: { 12: {} },
          requests: { 'test-uuid$$$$test-otherRid': { experimentId: 123 } }
        }
      })
    })
  })

  it('complains that the experiment has no branches 1', async () => {
    return expectErrorCode('branch-6', async () => {
      await ut({
        db: { query },
        headers: { 'x-access-key': 'test-access-key' },
        logger: { info: jest.fn(), error: jest.fn() },
        query: { uuid: 'test-uuid', rid: 'test-rid' },
        state: {
          accessKeys: { 'test-access-key': 12 },
          experiments: { 12: { 'test-uuid': {} } },
          requests: { 'test-uuid$$$$test-otherRid': { experimentId: 123 } }
        }
      })
    })
  })

  it('complains that the experiment has no branches 2', async () => {
    return expectErrorCode('branch-6', async () => {
      await ut({
        db: { query },
        headers: { 'x-access-key': 'test-access-key' },
        logger: { info: jest.fn(), error: jest.fn() },
        query: { uuid: 'test-uuid', rid: 'test-rid' },
        state: {
          accessKeys: { 'test-access-key': 12 },
          experiments: { 12: { 'test-uuid': { branches: [] } } },
          requests: { 'test-uuid$$$$test-otherRid': { experimentId: 123 } }
        }
      })
    })
  })

  it('success that caches the result, certainty with probs 0 and 1', async () => {
    const expiry = new Date(1235)
    indeterminant.random.mockReturnValue(0)
    indeterminant.now.mockReturnValue(1234)
    query.mockReturnValueOnce(Promise.resolve({ rows: [{ branch: 'C', expiry }] }))
    const requests = {}

    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error: jest.fn() },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        experiments: { 12: { 'test-uuid': {
          branches: [
            { probability: 0, value: 'A' },
            { probability: 1, value: 'B' },
          ],
          experimentId: 34,
          probabilitySum: 1,
          ttl: 23
        } } },
        requests
      }
    })

    expect(responseBody).toEqual({ branch: 'C', expiry })
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0][1]).toEqual([34, 'test-rid', 'B', 23, undefined])
    expect(query).toHaveBeenNthCalledWith(2, 'UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [34])
    expect(queryCatch).toHaveBeenCalledTimes(0)
    expect(requests).toEqual({ 'test-uuid$$$$test-rid': { branch: 'C', expiry, experimentId: 34 } })
  })

  it(`success that doesn't cache the result, certainty with probs 1 and 0`, async () => {
    const expiry = new Date(1233)
    indeterminant.random.mockReturnValue(0)
    indeterminant.now.mockReturnValue(1234)
    query.mockReturnValueOnce(Promise.resolve({ rows: [{ branch: 'C', expiry }] }))
    const requests = {}

    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error: jest.fn() },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        experiments: { 12: { 'test-uuid': {
          branches: [
            { probability: 1, value: 'A' },
            { probability: 0, value: 'B' },
          ],
          experimentId: 34,
          probabilitySum: 1,
          ttl: 23
        } } },
        requests
      }
    })

    expect(responseBody).toEqual({ branch: 'C', expiry })
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0][1]).toEqual([34, 'test-rid', 'A', 23, undefined])
    expect(query).toHaveBeenNthCalledWith(2, 'UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [34])
    expect(queryCatch).toHaveBeenCalledTimes(0)
    expect(requests).toEqual({})
  })

  it(`success that doesn't cache the result, A result with probs 1 and 1`, async () => {
    const expiry = new Date(1233)
    indeterminant.random.mockReturnValue(0)
    indeterminant.now.mockReturnValue(1234)
    query.mockReturnValueOnce(Promise.resolve({ rows: [{ branch: 'C', expiry }] }))
    const requests = {}

    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error: jest.fn() },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        experiments: { 12: { 'test-uuid': {
          branches: [
            { probability: 1, value: 'A' },
            { probability: 1, value: 'B' },
          ],
          experimentId: 34,
          probabilitySum: 1,
          ttl: 23
        } } },
        requests
      }
    })

    expect(responseBody).toEqual({ branch: 'C', expiry })
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0][1]).toEqual([34, 'test-rid', 'A', 23, undefined])
    expect(query).toHaveBeenNthCalledWith(2, 'UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [34])
    expect(queryCatch).toHaveBeenCalledTimes(0)
    expect(requests).toEqual({})
  })

  it(`success that doesn't cache the result, B result with probs 1 and 1`, async () => {
    const expiry = new Date(1233)
    indeterminant.random.mockReturnValue(1)
    indeterminant.now.mockReturnValue(1234)
    query.mockReturnValueOnce(Promise.resolve({ rows: [{ branch: 'C', expiry }] }))
    const requests = {}

    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error: jest.fn() },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        experiments: { 12: { 'test-uuid': {
          branches: [
            { probability: 1, value: 'A' },
            { probability: 1, value: 'B' },
          ],
          experimentId: 34,
          probabilitySum: 1,
          ttl: 23
        } } },
        requests
      }
    })

    expect(responseBody).toEqual({ branch: 'C', expiry })
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0][1]).toEqual([34, 'test-rid', 'B', 23, undefined])
    expect(query).toHaveBeenNthCalledWith(2, 'UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [34])
    expect(queryCatch).toHaveBeenCalledTimes(0)
    expect(requests).toEqual({})
  })

  it('success with cache hit, but with failed hits update', async () => {
    query.mockReturnValueOnce(Promise.reject(Error('test-error')))
    const error = jest.fn()
    await ut({
      db: { query },
      headers: { 'x-access-key': 'test-access-key' },
      logger: { info: jest.fn(), error },
      query: { uuid: 'test-uuid', rid: 'test-rid' },
      state: {
        accessKeys: { 'test-access-key': 12 },
        requests: { 'test-uuid$$$$test-rid': { branch: 'A', expiry: 'expiry', experimentId: 123 } }
      }
    })

    expect(responseBody).toEqual({ branch: 'A', expiry: 'expiry' })
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenCalledWith('UPDATE experiments SET hits = hits + 1 WHERE experiment_id = $1', [123])
    expect(queryCatch).toHaveBeenCalledTimes(0)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('Error updating hit count', Error('test-error'))
  })
})
