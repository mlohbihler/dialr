<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="form-component">
    <button :type="type" :id="id" :style="styles" @click="doClick"
        :class="classes + (loading ? ' loading' : '')"
        :disabled="disabled === undefined ? loading : disabled">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <slot v-if="!loading"></slot>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: String,
    id: String,
    classes: {
      type: String,
      default: ''
    },
    styles: String,
    loading: Boolean,
    disabled: Boolean
  },
  data() {
    return {}
  },
  methods: {
    doClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
