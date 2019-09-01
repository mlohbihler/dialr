<!-- Copyright Serotonin Software 2019 -->
<template>
  <span class="copy-container" ref="copyContainer" @click="copy" title="click to copy to clipboard">
    {{ str }}
    <span class="copied" ref="copied" :style="copiedStyles">Copied!</span>
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
      timeoutId: null,
      offset: { x: 0, y: 0 },
      leftDelta: null
    }
  },
  mounted() {
    // The 'copied' component will be visible just long enough to get the bounding client rect. We need this
    // value because for wrapped lines the x position of the parent is not the 0 left of the child.
    this.leftDelta = this.$refs.copied.getBoundingClientRect().left - this.$refs.copyContainer.getBoundingClientRect().left
    // Now we set the state to '' so it disappears.
    this.copiedState = ''
  },
  computed: {
    copiedStyles() {
      if (!this.copiedState) {
        // This is the default state, sort of. While the copied state is null, the element is displayed, but just
        // long enough to get is position.
        return {
          display: this.copiedState === null ? 'inherit' : 'none',
          opacity: 1,
          top: `${this.offset.top - 60}px`,
          left: `${this.offset.left - this.leftDelta}px`,
          transition: 'all 0s'
        }
      }
      // This is the state used when copiedState is 'clicked' or 'fading'.
      return {
        display: 'inherit',
        opacity: this.copiedState === 'clicked' ? 1 : 0,
        top: this.copiedState === 'clicked' ? `${this.offset.top - 20}px` : `${this.offset.top - 60}px`,
        left: `${this.offset.left - this.leftDelta}px`,
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

      // Place the copied indicator near where the mouse was clicked.
      const rect = this.$refs.copyContainer.getBoundingClientRect()
      const offset = {
        top: evt.y - rect.top,
        left: evt.x - rect.left
      }
      this.offset = offset

      this.copiedState = 'clicked'
      this.timeoutId = setTimeout(() => {
        this.copiedState = 'fading'
        this.timeoutId = setTimeout(() => {
          this.copiedState = ''
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
