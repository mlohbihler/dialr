const dialr1 = require('./index')({
  host: 'http://localhost:3000',
  accessKey: 'p9gGsIaM9sUJcWGooVSkzVfEWONROckG'
})

const dialr2 = require('./index')({
  host: 'http://localhost:3000',
  accessKey: 'rx36kGKKigIi9KwOMPpLn1ZV8Q9RnFK8'
})

async function test() {
  console.log(await dialr1('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'rid10', 'a', { clientCode: 'xxx' }))
  console.log(await dialr2('0bc25297-cc06-4a30-8748-d3b011adf659', 'rid10', 'a', { clientCode: 'xxx' }))
  console.log(await dialr1('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'rid11', 'a', { clientCode: 'xxx' }))
  console.log(await dialr2('0bc25297-cc06-4a30-8748-d3b011adf659', 'rid11', 'a', { clientCode: 'asdf' }))
  console.log(await dialr1('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'rid12', 'a', { clientCode: 'xxx' }))
  console.log(await dialr2('0bc25297-cc06-4a30-8748-d3b011adf659', 'rid12', 'a', { clientCode: 'zxcv' }))
  console.log(await dialr1('14ab5fd3-7a11-46ce-afa6-3d9b6a504504', 'rid13', 'a', { clientCode: 'xxx' }))
  console.log(await dialr2('0bc25297-cc06-4a30-8748-d3b011adf659', 'rid13', 'a', { clientCode: 'qwer' }))
}
test()


