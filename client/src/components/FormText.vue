<!-- Copyright Serotonin Software 2019 -->
<template>
  <div class="form-component">
    <label v-if="label">{{ label }}<span class="required" v-if=required>*</span></label>
    <input :id="id" ref="input" :type="type" :placeholder="placeholder" v-model="inputVal" @blur="blur" @focus="focus" @change="change"/>
    <div v-if="hint" class="hint">{{ hint }}</div>
    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
  </div>
</template>

<script>
export default {
  name: 'TextField',
  props: {
    label: String,
    required: Boolean,
    id: String,
    type: {
      required: true,
      validator: value => ['email', 'password', 'text'].indexOf(value) !== -1
    },
    placeholder: String,
    value: String,
    errorMsg: String,
    autofocus: Boolean,
    hint: String
  },
  data() {
    return {
      inputVal: this.value
    }
  },
  mounted() {
    if (this.autofocus) {
      this.$refs.input.focus()
    }
  },
  methods: {
    blur(e) { this.$emit('blur', e) },
    focus(e) { this.$emit('focus', e) },
    // Capturing the change event is useful for handing autofilled values.
    change(e) { this.$emit('input', this.inputVal) }
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
