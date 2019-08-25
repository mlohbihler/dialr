<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="form-component">
    <label v-if="label">{{ label }}<span class="required" v-if=required>*</span></label>
    <input :id="id" ref="input" type="checkbox" v-model="inputVal"/> <span class="checkbox-text">{{ placeholder }}</span>
    <div v-if="hint" class="hint">{{ hint }}</div>
    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    required: Boolean,
    id: String,
    placeholder: String,
    value: Boolean,
    errorMsg: String,
    hint: String
  },
  data() {
    return {
      inputVal: this.value
    }
  },
  watch: {
    value(val) {
      this.inputVal = val
    },
    inputVal(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
