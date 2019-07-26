<template>
  <div>
    This is the logout page
  </div>
  <!-- <WrapperPublic> -->
    <!-- <header> -->
      <!-- <h1>Logout</h1> -->
    <!-- </header> -->
    <!-- <div> -->
      <!-- Logout In Progress -->
    <!-- </div> -->
  <!-- </WrapperPublic> -->
</template>

<script>
// import WrapperPublic from '../includes/WrapperPublic'

import { dele } from '@/api'

export default {
  name: 'Logout',
  // components: { WrapperPublic },
  // computed: {},
  async mounted() {
    await dele('/session')
    this.$store.commit('setUserData', null)
    this.$router.push({ name: 'login', params: { status: 'loggedOut' } })
  }
}

// <template>
//   <div class="wrapper narrow">
//     <header>
//       <h1>Logout</h1>
//     </header>
//     <div class="c-card">
//       <div class="progessAlert">
//         <div class="spinner">
//           <div class="bounce1"></div>
//           <div class="bounce2"></div>
//           <div class="bounce3"></div>
//         </div>
//         Logout In Progress
//       </div>
//     </div>
//   </div>
// </template>

// <script>
// import { dele } from '@/api'

// export default {
//   name: 'PageLogout',
//   computed: {},
//   mounted() {
//     dele('/session')
//       .then(json => {
//         this.$store.commit('setUserData', { userData: null })
//         this.$router.push({ name: 'login', params: { status: 'loggedOut' } })
//       })
//   }
// }
// </script>

// <!-- Add "scoped" attribute to limit CSS to this component only -->
// <style lang="scss" scoped>

// .progessAlert {
//   text-align: center;

//   & .spinner {
//     display: block;
//     margin: 0 auto 20px auto;
//     width: 64px;
//     text-align: center;
//     line-height: 0;
//   }

//   & .spinner > div {
//     width: 16px;
//     height: 16px;
//     background-color: $brandBlue;
//     border-radius: 100%;
//     display: inline-block;
//     animation: sk-bouncedelay 1.4s infinite ease-in-out both;
//   }

//   & .spinner .bounce1 {
//     animation-delay: -0.32s;
//   }

//   & .spinner .bounce2 {
//     animation-delay: -0.16s;
//   }
// }

// @keyframes sk-bouncedelay {
//   0%, 80%, 100% {
//     -webkit-transform: scale(0);
//     transform: scale(0);
//   } 40% {
//     -webkit-transform: scale(1.0);
//     transform: scale(1.0);
//   }
// }
// </style>
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass" scoped>
</style>
