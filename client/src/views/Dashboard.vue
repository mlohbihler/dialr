<!-- Copyright Serotonin Software 2019 -->
<template>
  <div>
    <Loading v-if="!loaded"/>
    <p>This is the dashboard page. You have {{ experimentCountText }}. </p>
  </div>
  <!-- <header> -->
    <!-- <h1>Dashboard</h1> -->
  <!-- </header> -->
  <!-- <div class="dashWidgets"> -->
    <!-- <DashboardWidget title="Devices" -->
        <!-- :hasSettings="true" -->
        <!-- :showSettings="deviceSettingsOpen" -->
        <!-- :loading="loadingDevices" -->
        <!-- @open-widget-settings="openDeviceSettings" -->
        <!-- @close-widget-settings="deviceSettingsOpen = false" -->
        <!-- @save-widget-settings="saveDeviceSettings"> -->
      <!-- <template slot="content"> -->
        <!-- <div class="widgetWrapper"> -->
          <!-- <div v-if="deviceData.length" class="item devices" v-for="(item, index) in deviceData" :key="item.location" @click="deviceListLink(item.location)"> -->
            <!-- <div class="labels"> -->
              <!-- <div class="title">{{ item.location || '(no location)' }}</div> -->
              <!-- <div class="sub"> -->
                <!-- <div v-if="device.count > 0" v-for="device in item.devices" :key="device.name" -->
                    <!-- @mouseover="toggleArrow('count-' + index)" @mouseout="toggleArrow('count-' + index)" @click="deviceListLink(item.location, device.name)"> -->
                  <!-- <span>{{ device.count }}</span> {{ device.name }}s -->
                <!-- </div> -->
              <!-- </div> -->
            <!-- </div> -->
            <!-- <div class="count" :ref="'count-' + index">{{ item.total }}<span>Total</span></div> -->
          <!-- </div> -->
          <!-- <div v-else class="noItems">There are no devices to show.</div> -->
          <!-- <router-link :to="{ name: 'devices', params: { filter: {} } }" class="all">View All Devices</router-link> -->
        <!-- </div> -->
      <!-- </template> -->
      <!-- <template slot="settings"> -->
        <!-- <SelectMenu :options="locationsLengthOptions" :selected="editLocationsLength" label="Maximum number of locations to show?" @change='setLocationsLength' /> -->
        <!-- <SelectMenu :options="locationsSortOptions" :selected="editLocationsSort" label="Sort locations:" @change='setLocationsSort' /> -->
      <!-- </template> -->
    <!-- </DashboardWidget> -->
  <!-- </div> -->
</template>

<script>
import Loading from '@/components/Loading'

import { get } from '@/api'
// import { mapActions, mapGetters } from 'vuex'
import { plural } from '@/util'

export default {
  components: { Loading },
  data() {
    return {
      loaded: false,
      experiments: null
      // // Device widget data
      // loadingDevices: true,
      // rawDeviceData: [],
      // deviceSettingsOpen: false,
      // locationsLengthOptions: [
      //   { value: 5, label: '5' },
      //   { value: 10, label: '10' },
      //   { value: 25, label: '25' },
      //   { value: 9999, label: 'All' }
      // ],
      // locationsLength: 9999,
      // editLocationsLength: 9999,
      // locationsSortOptions: [
      //   { value: 'alpha', label: 'Alphabetically' },
      //   { value: 'mostDevices', label: 'By device count' },
      //   { value: 'mostRecent', label: 'By most recently added devices' }
      // ],
      // locationsSort: 'alpha',
      // editLocationsSort: 'alpha',

      // // Services widget data
      // loadingServices: true,
      // rawServiceData: [],
      // serviceSettingsOpen: false,
      // servicesLengthOptions: [
      //   { value: 5, label: '5' },
      //   { value: 10, label: '10' },
      //   { value: 15, label: '15' },
      //   { value: 20, label: '20' },
      //   { value: 25, label: '25' }
      // ],
      // servicesLength: 5,
      // editServicesLength: 5,
      // servicesRunning: false,
      // editServicesRunning: false,

      // // Batteries widget data
      // loadingBatteries: true,
      // rawBatteryData: [],
      // batterySettingsOpen: false,
      // batteriesLengthOptions: [
      //   { value: 5, label: '5' },
      //   { value: 10, label: '10' },
      //   { value: 15, label: '15' },
      //   { value: 20, label: '20' },
      //   { value: 25, label: '25' }
      // ],
      // batteriesLength: 5,
      // editBatteriesLength: 5,
      // batteriesRunning: false,
      // editBatteriesRunning: false,

      // // News widget data
      // newsData: []
    }
  },
  async beforeMount() {
    const result = await get('/experiments')
    console.log(result)
    this.experiments = result.experiments
    this.loaded = true
  },
  computed: {
    // ...mapGetters(['getUISetting']),
    experimentCount() {
      return this.experiments ? this.experiments.length : 0
    },
    experimentCountText() {
      return plural(this.experimentCount, 'experiment')
    }
    // deviceData() {
    //   const data = [ ...this.rawDeviceData ]

    //   // Sort by locations sort order.
    //   let sortfn = (a, b) => nullSafeNoCaseStringCompare(a.location, b.location)
    //   if (this.locationsSort === 'mostDevices') {
    //     sortfn = (a, b) => b.total - a.total
    //   } else if (this.locationsSort === 'mostRecent') {
    //     sortfn = (a, b) => b.latestInServiceDate - a.latestInServiceDate
    //   }
    //   data.sort(sortfn)

    //   // Limit to the locations length.
    //   if (data.length > this.locationsLength) {
    //     data.length = this.locationsLength
    //   }

    //   return data
    // },
    // serviceData() {
    //   let data

    //   // Show only running services?
    //   if (this.servicesRunning) {
    //     data = this.rawServiceData.filter(e => e.status === 'servicing')
    //   } else {
    //     data = [ ...this.rawServiceData ]
    //   }

    //   // Limit to the services length.
    //   if (data.length > this.servicesLength) {
    //     data.length = this.servicesLength
    //   }

    //   return data
    // },
    // batteryData() {
    //   let data

    //   // Show only batteries currently beign serviced?
    //   if (this.batteriesRunning) {
    //     data = this.rawBatteryData.filter(e => e.status === 'servicing')
    //   } else {
    //     data = [ ...this.rawBatteryData ]
    //   }

    //   // Limit to the batteries length.
    //   if (data.length > this.batteriesLength) {
    //     data.length = this.batteriesLength
    //   }

    //   return data
    // },
    // hasNews() {
    //   return this.newsData.filter(e => e.unread).length > 0
    // }
  },
  // methods: {
  //   ...mapActions(['saveUISettings']),

  //   // Device methods
  //   devicesRefresh() {
  //     this.loadingDevices = true
  //     post('/devices/getUpdates')
  //       .then(result => {
  //         // Turn the throbber off
  //         this.loadingDevices = false

  //         // Transform the headers array into a map for quick lookup.
  //         const columnNames = columnsToIndexMap(result.columns)

  //         // Aggregate the device data into locations and device types.
  //         const aggregated = {}
  //         result.devices.forEach(row => {
  //           const location = row[columnNames.location] || ''
  //           const modelName = row[columnNames.modelName]
  //           const inServiceDate = row[columnNames.inServiceDate] || 0
  //           // Create or add to the locations.
  //           if (!aggregated[location]) {
  //             aggregated[location] = { models: {}, latestInServiceDate: inServiceDate }
  //           }
  //           // Create or add to the device types.
  //           if (!aggregated[location].models[modelName]) {
  //             aggregated[location].models[modelName] = 0
  //           }
  //           aggregated[location].models[modelName]++
  //           if (aggregated[location].latestInServiceDate < inServiceDate) {
  //             aggregated[location].latestInServiceDate = inServiceDate
  //           }
  //         })

  //         // Convert the aggregated data into the format we need for the widget.
  //         const deviceData = []
  //         forOwn(aggregated, (locValue, locKey) => {
  //           const locationData = {
  //             location: locKey,
  //             total: 0,
  //             devices: [],
  //             latestInServiceDate: locValue.latestInServiceDate
  //           }
  //           deviceData.push(locationData)

  //           forOwn(locValue.models, (modValue, modKey) => {
  //             const modelData = {
  //               name: modKey,
  //               count: modValue
  //             }
  //             locationData.devices.push(modelData)
  //             locationData.total += modValue
  //           })

  //           // Sort the models
  //           locationData.devices.sort((a, b) => nullSafeNoCaseStringCompare(a.name, b.name))
  //         })

  //         this.rawDeviceData = deviceData
  //       })
  //   },
  //   setLocationsLength(value) {
  //     this.editLocationsLength = value
  //   },
  //   setLocationsSort(value) {
  //     this.editLocationsSort = value
  //   },
  //   openDeviceSettings() {
  //     this.deviceSettingsOpen = true
  //     this.editLocationsLength = this.locationsLength
  //     this.editLocationsSort = this.locationsSort
  //   },
  //   saveDeviceSettings() {
  //     this.deviceSettingsOpen = false
  //     this.locationsLength = this.editLocationsLength
  //     this.locationsSort = this.editLocationsSort
  //     this.saveUISettings({ path: 'dashboard.devices', value: { length: this.locationsLength, sort: this.locationsSort } })
  //   },
  //   deviceListLink(location, deviceName) {
  //     const keywords = []
  //     if (location) {
  //       keywords.push(location)
  //     }
  //     if (deviceName) {
  //       keywords.push(deviceName)
  //     }
  //     if (keywords.length) {
  //       this.$router.push({ name: 'devices', params: { filter: { keywords } } })
  //     }
  //   },

  //   // Service methods
  //   servicesRefresh() {
  //     this.loadingServices = true
  //     post('/services/getUpdates')
  //       .then(result => {
  //         // Turn the throbber off
  //         this.loadingServices = false

  //         // Transform the headers array into a map for quick lookup.
  //         const columnNames = columnsToIndexMap(result.columns)

  //         // Convert data to maps.
  //         const serviceData = []
  //         result.services.forEach(row => serviceData.push({
  //           serviceType: row[columnNames.serviceType],
  //           status: row[columnNames.status],
  //           startTime: row[columnNames.startTime],
  //           location: row[columnNames.location] || '',
  //           deviceType: row[columnNames.deviceModelName],
  //           bayId: row[columnNames.bayId],
  //           batterySerialNumber: row[columnNames.batterySerialNumber] // Required for list linking
  //         }))

  //         // Sort by start time
  //         serviceData.sort((a, b) => b.startTime - a.startTime)

  //         this.rawServiceData = serviceData
  //       })
  //   },
  //   setServicesLength(value) {
  //     this.editServicesLength = value
  //   },
  //   openServiceSettings() {
  //     this.serviceSettingsOpen = true
  //     this.editServicesLength = this.servicesLength
  //     this.editServicesRunning = this.servicesRunning
  //   },
  //   saveServiceSettings() {
  //     this.serviceSettingsOpen = false
  //     this.servicesLength = this.editServicesLength
  //     this.servicesRunning = this.editServicesRunning
  //     this.saveUISettings({ path: 'dashboard.services', value: { length: this.servicesLength, running: this.servicesRunning } })
  //   },
  //   serviceListLink(service) {
  //     this.$router.push({
  //       name: 'services',
  //       params: { filter: {
  //         keywords: [service.batterySerialNumber],
  //         startTimeRange: [service.startTime, service.startTime]
  //       }}
  //     })
  //   },

  //   // Battery methods
  //   batteriesRefresh() {
  //     this.loadingBatteries = true
  //     post('/batteries/getUpdates')
  //       .then(result => {
  //         // Turn the throbber off
  //         this.loadingBatteries = false

  //         // Transform the headers array into a map for quick lookup.
  //         const columnNames = columnsToIndexMap(result.columns)

  //         // Convert the data to a list of maps with the values we need.
  //         const batteryData = []
  //         result.batteries.forEach(row => batteryData.push({
  //           lastServiceTime: row[columnNames.lastServiceTime],
  //           lastServiceType: row[columnNames.lastServiceType] || '',
  //           location: row[columnNames.lastLocation] || '', // Required for the SoH chart
  //           modelName: row[columnNames.modelName],
  //           soh: row[columnNames.lastSoh], // Required for the SoH chart
  //           status: row[columnNames.lastStatus],
  //           serialNumber: row[columnNames.serialNumber] // Required for list linking
  //         }))

  //         // Sort by last service time
  //         batteryData.sort((a, b) => b.lastServiceTime - a.lastServiceTime)

  //         this.rawBatteryData = batteryData
  //       })
  //   },
  //   setBatteriesLength(value) {
  //     this.editBatteriesLength = value
  //   },
  //   openBatterySettings() {
  //     this.batterySettingsOpen = true
  //     this.editBatteriesLength = this.batteriesLength
  //     this.editBatteriesRunning = this.batteriesRunning
  //   },
  //   saveBatterySettings() {
  //     this.batterySettingsOpen = false
  //     this.batteriesLength = this.editBatteriesLength
  //     this.batteriesRunning = this.editBatteriesRunning
  //     this.saveUISettings({ path: 'dashboard.batteries', value: { length: this.batteriesLength, running: this.batteriesRunning } })
  //   },
  //   batteryListLink(battery) {
  //     this.$router.push({ name: 'batteries', params: { filter: { keywords: [battery.serialNumber] } } })
  //   },

  //   // News methods
  //   newsRefresh() {
  //     // TODO
  //     this.newsData = [
  //       { date: 'Yesterday', title: 'C7400 Firmware 2.2.14 Released', content: 'New firmware has been released, addressing minor bugs and performance fixes. See <a href="somelink">release notes</a>.', unread: true },
  //       { date: 'Aug 21, 2018', title: 'Upcoming Maintenance', content: 'Battery Embassy will be offline June 24, from 2 AM PST to 4 AM PST for scheduled maintenance.', unread: true },
  //       { date: 'Aug 16, 2018', title: 'C5100B On Sale', content: `We're having a sale on our C5100B units until June 20th. You can save on <a href="somelink">individual units</a> as well as some <a href="somelink">great bundles</a> online! Or call our sales department at 1-800-123-4567.`, unread: true }
  //     ]
  //   },
  //   dismissNews(index) { // animate item closed and update news item status
  //     const newsRef = 'news-' + index
  //     let itm = this.$refs[newsRef][0]
  //     itm.style.height = itm.clientHeight + 'px'
  //     this.newsData[index].unread = false
  //   },

  //   // Other methods
  //   // Used just to un-animate devices .item > .count arrow when moused over a sub-group of devices
  //   toggleArrow(ref) {
  //     this.$refs[ref][0].classList.toggle('off')
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
// .dashWidgets {
//   display: flex;
//   justify-content: space-between;
//   flex-wrap: wrap;
//   //align-items: flex-start;

//   @media screen and (max-width: $breakMed) {
//     flex-direction: column;
//   }
// }
// .widgetWrapper {
//   position: relative;
//   width: 100%;
//   height: 100%;
//   padding: 50px 0 40px 0;

//   &.newsWrapper {
//     padding: 50px 0 0 0;
//   }

//   & .noItems {
//     padding: 70px 0 40px 0;
//     text-align: center;
//     @include body-bold;
//     color: $warningColor;
//     position: absolute;
//     width: 100%;
//     left: 0;
//     top: 50%;
//     transform: translateY(-50%);
//   }

//   & .item {
//     padding: 10px 10px 10px 15px;
//     margin: 0;
//     border-bottom: 1px solid $greyMed;
//     transition: all 300ms;
//     cursor: pointer;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     position: relative;

//     & .labels {
//       font-size: 11px;
//       line-height: 15px;

//       & .title {
//         font-size: 14px;
//         color: #000;
//         position: relative;
//         z-index: 1;
//       }
//       & .sub {
//         display: flex;
//         padding: 5px 0 0 0;
//         position: relative;
//         z-index: 1;
//       }
//     }

//     // device-specific
//     &.devices {
//       & .labels {
//         & .sub {
//           flex-wrap: wrap;

//           & div {
//             display: flex;
//             align-items: center;
//             margin: 5px 15px 0 0;
//             color: $brandBlue;
//             transition: all 200ms;

//             &:last-child {
//               margin: 5px 0 0 0;
//             }

//             & span {
//               border-radius: 3px;
//               padding: 2px 3px;
//               text-align: center;
//               display: flex;
//               align-items: center;
//               justify-content: space-around;
//               line-height: 11px;
//               border: 1px solid $brandBlueLight;
//               margin: 0 4px 0 0;
//             }
//             &:hover {
//               text-decoration: none;
//               color: #000;
//               & span {
//                 border: 1px solid $greyDark;
//               }
//             }
//           }
//         }
//       }
//     }
//     // services and batt specific
//     &.data {
//       justify-content: flex-start;
//       align-items: flex-start;

//       & .labels {
//         width: 85%;
//         & .sub {
//           padding: 5px 0 0 0;

//           @media screen and (max-width: $breakSmall) {
//             flex-wrap: wrap;
//           }

//           & div {
//             width: 25%;
//             margin: 8px 0 0 0;
//             padding: 0 5px 0 0;
//             display: flex;
//             align-items: center;
//             color: #999;
//             transition: all 200ms;

//             @media screen and (max-width: $breakHandsetLandscape) {
//               width: 50%;
//             }

//             & span {
//               white-space: nowrap;
//               overflow: hidden;
//               text-overflow: ellipsis;
//             }

//             & svg {
//               flex-shrink: 0;
//               width: 13px;
//               height: 13px;
//               margin: 0 5px 0 0;
//               fill: #999;

//               &.device {
//                 width: 16px;
//                 height: 16px;
//               }
//               &.bays {
//                 width: 20px;
//               }
//               &.service {
//                 width: 13px;
//               }
//               &.gauge {
//                 width: 16px;
//               }
//             }
//           }
//         }
//       }
//     }
//     // news widget
//     &.news {
//       display: block;
//       padding: 0;
//       cursor: default;
//       overflow: hidden;

//       & .wrapper {
//         display: flex;
//         flex-direction: column;
//         align-items: flex-start;
//         line-height: 15px;
//         padding: 15px 15px 15px 0;
//         position: relative;
//       }

//       & .dismiss {
//         position: absolute;
//         top: 15px;
//         right: 15px;
//         width: 22px;
//         height: 22px;
//         border-radius: 11px;
//         cursor: pointer;
//         transition: all 200ms;

//         & svg {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%,-50%);
//           width: 10px;
//           height: 10px;
//           fill: $brandBlue;
//         }
//         &:hover {
//           background: $greyLight;
//         }
//       }
//       & .date {
//         font-size: 10px;
//         text-transform: uppercase;
//         color: #fff;
//         //color: #999;
//         background: $greyDark;
//         //background: $brandBlue;
//         //background: $greyMed;
//         height: 16px;
//         padding: 0 10px 0 15px;
//         border-radius: 0 8px 8px 0;
//         display: flex;
//         align-items: center;
//       }
//       & .title {
//         margin: 15px 0 0 0;
//         padding: 0 15px;
//         color: #000;
//       }
//       & .content {
//         font-size: 12px;
//         margin: 10px 0 0 0;
//         padding: 0 15px;
//         color: #999;
//         width: 100%;
//       }

//       &:hover {
//         background: none;
//       }
//     }
//     & .count {
//       width: 75px;
//       flex-shrink: 0;
//       //border-left: 1px solid $brandBlueLight;
//       padding: 8px 0;

//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       font-size: 24px;
//       color: $brandBlue;
//       position: relative;
//       z-index: 1;
//       transition: all 300ms;

//       &:before {
//         content: '';
//         position: absolute;
//         top: 0;
//         left: 0;
//         height: 50%;
//         width: 1px;
//         background: $brandBlueLight;
//         transition: all 300ms;
//       }
//       &:after {
//         content: '';
//         position: absolute;
//         bottom: 0;
//         left: 0;
//         height: 50%;
//         width: 1px;
//         background: $brandBlueLight;
//         transition: all 300ms;
//       }

//       & span {
//         color: $greyDark;
//         text-transform: uppercase;
//         @include body-bold;
//         font-size: 10px;
//         line-height: 12px;
//         padding: 3px 0 0 0;
//       }

//       &:hover {
//         color: $brandBlueDark;
//       }
//     }
//     & .arrow {
//       position: absolute;
//       right: 18px;
//       top: 50%;
//       transform: translateY(-50%);
//       width: 12px;
//       height: 18px;
//       transition: all 200ms ease-in;

//       & svg {
//         fill: $brandBlue;
//         width: 100%;
//         height: 100%;
//       }
//     }

//     // .item hover
//     &:hover {
//       background: $greyScreen;
//       & .count {
//         &:before {
//           transform-origin: 0 0;
//           transform: skewX(20deg);
//           background: $brandBlue;
//         }
//         &:after {
//           transform-origin: 0 100%;
//           transform: skewX(-20deg);
//           background: $brandBlue;
//         }
//       }
//       & .arrow {
//         right: 10px;
//       }
//       &.data {
//         & .labels {
//           & .sub {
//             & div {
//               color: #000;
//             }
//           }
//         }
//       }
//     }
//   }

//   & .all {
//     position: absolute;
//     left: 0;
//     bottom: 0;
//     right: 0;
//     padding: 0 15px;
//     height: 40px;
//     display: flex;
//     align-items: center;
//     font-size: 11px;
//     background: #fff;
//     transition: all 200ms;

//     &:hover {
//       background: $greyLight;
//       text-decoration: none;
//     }
//   }
// }
// </style>
// <style lang="scss">
// .count.off {
//   &:before {
//     transform: skewX(0deg) !important;
//     background: $brandBlueLight !important;
//   }
//   &:after {
//     transform: skewX(0deg) !important;
//     background: $brandBlueLight !important;
//   }
// }
</style>
