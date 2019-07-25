<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="testApi">Test the API</button>
  </div>
</template>

<script>
import { get } from '@/api'

export default {
  data() {
    return {}
  },
  methods: {
    async testApi() {
      const response = await get('/session')
      console.log('response', response)
    }
  }
}
</script>
