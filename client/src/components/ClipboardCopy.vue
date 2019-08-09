<!-- Copyright Serotonin Software 2019 -->
<template>
  <span class="copy-container" @click="copy" title="click to copy to clipboard">
    <slot></slot>
    <span class="copied" :style="copiedStyles">Copied!</span>
  </span>
</template>

<script>
import { copyToClipboard } from '@/util'

export default {
  props: {
    str: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      copiedState: null,
      timeoutId: null
    }
  },
  computed: {
    copiedStyles() {
      if (!this.copiedState) {
        return {
          display: 'none',
          opacity: 0,
          top: '-50px',
          transition: 'all 0s'
        }
      }
      return {
        display: 'inherit',
        opacity: this.copiedState === 'clicked' ? 1 : 0,
        top: this.copiedState === 'clicked' ? '-10px' : '-50px',
        transition: 'all 1.5s'
      }
    }
  },
  methods: {
    async copy(evt) {
      // Copy the text to the clipboard.
      copyToClipboard(this.str)

      // Cancel any existing animation
      clearTimeout(this.timeoutId)

      this.copiedState = 'clicked'
      this.timeoutId = setTimeout(() => {
        this.copiedState = 'fading'
        this.timeoutId = setTimeout(() => {
          this.copiedState = null
        }, 1500)
      }, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.copy-container {
  position: relative;
  cursor: pointer;
}

.copied {
  position: absolute;
  left: 0px;
  font-size: 16px;
  font-weight: bold;
  color: $brandGreen;
  overflow: visible;
}
</style>
