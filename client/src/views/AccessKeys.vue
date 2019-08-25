<!-- Copyright Serotonin Software 2019 -->
<template>
  <div>
    <Loading v-if="!loaded"/>
    <div v-else class="accessKey-list">
      <p>
        Access keys are used by your client code to request a branch. You should cycle your keys regularly.
        You have {{ accessKeyCountText }}.
      </p>
      <table class="wide">
        <thead>
          <tr>
            <th>Access key</th>
            <th>Created</th>
            <th>Last used</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(key, i) in accessKeys" :key="key.accessKey">
            <td><ClipboardCopy :str="key.accessKey">{{ key.accessKey }}</ClipboardCopy></td>
            <td>{{ since(key.created) }} ago</td>
            <td>{{ key.lastUsed ? `${since(key.lastUsed)} ago` : '(never)' }}</td>
            <td class="center"><i class='fa fa-trash' title="delete" @click="deleteKey(key, i)"></i></td>
          </tr>
          <tr><td colspan="4" class="center"><i class="fa fa-plus" @click="tryAdd" title="add another access key"></i></td></tr>
        </tbody>
      </table>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import ClipboardCopy from '@/components/ClipboardCopy'
import Loading from '@/components/Loading'

import { dele, get, post } from '@/api'
import { plural, since } from '@/util'

export default {
  components: { ClipboardCopy, Loading },
  data() {
    return {
      loaded: false,
      accessKeys: null,
      loading: false,
      error: null
    }
  },
  async beforeMount() {
    const result = await get('/access-keys')
    this.accessKeys = result.accessKeys
    this.loaded = true
  },
  computed: {
    accessKeyCount() {
      return this.accessKeys ? this.accessKeys.length : 0
    },
    accessKeyCountText() {
      return plural(this.accessKeyCount, 'access key', 'access keys')
    }
  },
  methods: {
    async tryAdd() {
      this.loading = true
      const result = await post('/access-keys')
      this.loading = false

      if (result.error) {
        this.error = result.error.message
      } else {
        this.accessKeys.push(result)
      }
    },
    async deleteKey(key, index) {
      dele(`/access-keys/${key.accessKey}`)
      this.accessKeys.splice(index, 1)
    },
    since(date) {
      return since(new Date(date))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.fa-trash:hover { color: $brandRed; }
.fa-plus:hover { color: $brandGreen; }
</style>
