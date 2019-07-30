<template>
  <transition name="fade">
    <div class="loading">
      <div class="loader">
        <div class="spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
        <div class="label">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  },
  data() {
    return {}
  }
}
</script>

<style scoped lang="scss">
.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 11;

  & .loader {
    position: absolute;
    left: 10px;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  & .label {
    font-size: 14px;
    margin: 10px auto 0 auto;
    color: $brandBlue;
    text-align: center;
  }

  & .spinner {
    display: block;
    margin: 0 auto;
    width: 64px;
    text-align: center;
    line-height: 0;
  }

  & .spinner > div {
    width: 16px;
    height: 16px;
    background-color: $brandBlue;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  & .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  & .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
    background-color: $brandGreen;
  }

  @-webkit-keyframes sk-bouncedelay {
    0%, 80%, 100% { -webkit-transform: scale(0) }
    40% { -webkit-transform: scale(1.0) }
  }

  @keyframes sk-bouncedelay {
    0%, 80%, 100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    } 40% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
    }
  }
}
</style>
