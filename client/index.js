const axios = require('axios')

module.exports = config => {
  return async (eid, rid, def, params) => {
    try {
      const response = await axios({
        method: 'get',
        url: config.host + '/mi/branch',
        params: { eid, rid, ...params },
        headers: { 'x-access-key': config.accessKey },
        timeout: 500,
        validateStatus: status => (status >= 200 && status < 300) || status === 400
      })
      const { data } = response
      if (data.error) {
        console.warn('Error in DiaLR call', data.error)
        return def
      }
      return data.branch
    } catch (err) {
      console.error('DiaLR call failed', err)
      return def
    }
  }
}
