This folder includes sample code for a Node-based DialR client that can be included in your Node code, or modified to your needs.

```javascript
// First, create the DialR client, providing the host and access key.
const dialr = require('./index')({
  host: 'http://localhost:3000',
  accessKey: 'p9gGsIaM9sUJcWGooVSkzVfEWONROckG'
})

// Then, make calls as required using your experiment id and request id, and optionally provide
// the default branch and filtering parameters to include.
async function test() {
  console.log(await dialr('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'r1', 'a', { clientCode: 'xxx' }))
  console.log(await dialr('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'r2', 'a', { clientCode: 'xxx' }))
  console.log(await dialr('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'r3', 'a', { clientCode: 'xxx' }))
}
test()
```
