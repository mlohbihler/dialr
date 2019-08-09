<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="narrow">
    <Loading v-if="!loaded"/>
    <template v-else>
      <p>You have {{ accessKeyCountText }}. </p>
      <ul>
        <ol v-for="(key , i) in accessKeys" :key="key">
          <div class="key"><ClipboardCopy :str="key">{{ key }}</ClipboardCopy></div>
          <div class="actions">
            <i class='fa fa-times' title="delete" @click="deleteKey(key, i)"></i>
          </div>
        </ol>
      </ul>
      <div v-if="error" class="error-message">{{ error }}</div>
      <FormButton class="link" @click="tryAdd" :loading="loading">Create new access key</FormButton>
    </template>
  </div>
</template>

<script>
import ClipboardCopy from '@/components/ClipboardCopy'
import FormButton from '@/components/FormButton'
import Loading from '@/components/Loading'

import { dele, get, post } from '@/api'
import { plural } from '@/util'

export default {
  components: { ClipboardCopy, FormButton, Loading },
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
        this.accessKeys.push(result.accessKey)
      }
    },
    async deleteKey(key, index) {
      dele(`/access-keys?key=${key}`)
      this.accessKeys.splice(index, 1)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
ul {
  padding: 0;

  ol {
    text-align: left;
    padding: 3px 0;
    background-color: #F0F0F0;
    display: flex;

    div {
      &.key {
        padding: 0 5px;
        width: 360px;
      }

      &.actions {
        opacity: 0;
        transition: all 0.5s;

        i {
          padding: 0 5px;
          cursor: pointer;

          &.fa-copy { color: $brandBlue; }
          &.fa-times { color: $brandRed; }
        }
      }
    }

    &:nth-child(even) {
      background-color: #E0E0E0;
    }

    &:hover {
      div {
        &.actions {
          opacity: 1;
        }
      }
    }
  }
}
</style>
