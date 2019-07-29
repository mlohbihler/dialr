<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="home">
    <img alt="DiaLR logo" src="../assets/dialr-lg.png">

    <h1>Dial up your deployments!</h1>
    <p>
      DiaLR helps you manage tricky deployments by allowing you to control their release in real
      time. The idea is simple. From within your code you make a (REST) call to DiaLR, and DiaLR
      returns you a branch to follow. All you need is an if/then/else structure to follow the given
      branch. Your call to DiaLR includes a request ID; whenever you send the same request ID you
      are guaranteed to receive the same branch decision, so you can write similar branches
      wherever in your code you need them.
    </p>
    <pre class="code">
      // Ask dialr for a branch to follow. The last parameter is the
      // default value in case of failure.
      const branch = await dialr('experiment-id', 'my-request-id', 'A')

      if (branch === 'A') {
        // You define the branch values, so they can be
        // and mean anything you want.
        console.log('This is my original code')
      } else {
        // You also define the probability that a given
        // branch will be selected.
        console.log('This is my shiny new code')
      }</pre>
    <caption class="code">Node / Javascript / ECMAScript example</caption>
    <p>
      You can write your client code in any language that can make a REST call. (Call latency can
      be around 20ms for the first call with a particular request ID, but is usually around 4ms
      after that.) Then, while you are dialing up, if you notice a problem you can set your new
      code probability to zero to immedately back it out. If everything looks good, once your are
      done dialing up your new code to 100%, you can now with confidence remove the DiaLR call and
      branch handling from your code.
    </p>

    <h1>The details</h1>
    <p>
      Your REST call will also include the header 'x-access-key' with a value that is an access key
      that belongs to you. This help restrict who can call what experiments. You can also send an
      'outcome' parameter if you want to record something that happened in the request. You can
      create access keys, create and control experiments, and view outcomes in the DiaLR UI.
    </p>
    <p>
      DiaLR is open source code, so you can download and install it to run in your own environment.
      But you can also use a super-fast <a href="https://dialr.org">cloud version</a> of it too. As
      you'll see, DiaLR can be (and should be!) configured with values that are only meaningful to
      you, so you never need to share sensitive data.
    </p>
  </div>
</template>

<script>
export default {
  name: 'home'
}
</script>

<style scoped lang="scss">
.home {
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: $brandBlue;
  }
  pre.code {
    text-align: left;
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-left: 3px solid #f36d33;
    color: #444;
    page-break-inside: avoid;
    font-family: monospace;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 0.4em;
    max-width: 100%;
    overflow: auto;
    padding: 1em 1.5em;
    display: block;
    word-wrap: break-word;
  }
  caption.code {
    display: block;
  }
}
</style>
