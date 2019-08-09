<!-- Copyright Serotonin Software 2019 -->
<template>
  <div>
    <Loading v-if="!loaded"/>
    <div v-else class="experiment-list">
      <p>This is the dashboard page. You have {{ experimentCountText }}.</p>
      <table class="experiments">
        <thead>
          <th></th>
          <th>UUID</th>
          <th>Title</th>
          <th>Running</th>
          <th>TTL</th>
          <th></th>
        </thead>
        <tbody>
          <template v-for="(exp, index) in experiments">
            <tr :key="exp.uuid + '-head'" :class="[getRowParity(index), exp.expanded ? 'open' : 'closed']">
              <td class="center"><i :class="getToggleClasses(exp)" :title="exp.expanded ? 'close' : 'open'" @click="toggleRow(exp)"></i></td>
              <td><ClipboardCopy :str="exp.uuid">{{ exp.uuid }}</ClipboardCopy></td>
              <td>{{ exp.title }}</td>
              <td class="center"><i v-if="exp.running" class="fa fa-check" title="running"></i></td>
              <td class="center">{{ exp.requestTtl }}s</td>
              <td><i class="fa fa-edit" title="edit"></i></td>
            </tr>
            <tr :key="exp.uuid + '-deets'" v-if="exp.expanded" :class="[getRowParity(index), 'deets']">
              <td colspan="6">
                <div class="description" v-if="exp.description">{{ exp.description }}</div>
                <div class="branches">
                  <table class="branches">
                    <thead>
                      <th>Branch</th>
                      <th>Probability</th>
                      <th></th>
                    </thead>
                    <tbody :class="getRowParity(index)">
                      <tr v-for="branch in exp.branches" :key="branch.value">
                        <td>{{ branch.value }}</td>
                        <td>{{ branch.probability }} ({{ branch.percent }}%)</td>
                        <td><i class="fa fa-edit" title="edit"></i></td>
                      </tr>
                      <tr><td colspan="3"><i class="fa fa-plus" title="add another branch"></i></td></tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
          <tr><td colspan="6" class="center"><i class="fa fa-plus" title="add another experiment"></i></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ClipboardCopy from '@/components/ClipboardCopy'
import Loading from '@/components/Loading'

import { get } from '@/api'
// import { mapActions, mapGetters } from 'vuex'
import { plural } from '@/util'

export default {
  components: { ClipboardCopy, Loading },
  data() {
    return {
      loaded: false,
      experiments: []
    }
  },
  async mounted() {
    const result = await get('/experiments')

    result.experiments.forEach(e => {
      // Add an expanded attribute to each row
      e.expanded = true

      // Calculate the sum of all the branches.
      const sum = e.branches.reduce((agg, cur) => agg + cur.probability, 0)

      // Then assign a percentage to each branch.
      e.branches.forEach(b => { b.percent = Math.round(b.probability * 100 / sum) })

      this.experiments.push(e)
    })

    console.log(this.experiments)
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
  methods: {
  //   ...mapActions(['saveUISettings']),
    getToggleClasses(exp) {
      return ['fa', `fa-chevron-${exp.expanded ? 'up' : 'down'}`]
    },
    getRowParity(index) {
      return index % 2 === 0 ? 'even' : 'odd'
    },
    toggleRow(exp) {
      exp.expanded = !exp.expanded
      console.log(exp)
    }
    // setLocationsSort(value) {
    //   this.editLocationsSort = value
    // },
    // openDeviceSettings() {
    //   this.deviceSettingsOpen = true
    //   this.editLocationsLength = this.locationsLength
    //   this.editLocationsSort = this.locationsSort
    // },
    // saveDeviceSettings() {
    //   this.deviceSettingsOpen = false
    //   this.locationsLength = this.editLocationsLength
    //   this.locationsSort = this.editLocationsSort
    //   this.saveUISettings({ path: 'dashboard.devices', value: { length: this.locationsLength, sort: this.locationsSort } })
    // },
    // deviceListLink(location, deviceName) {
    //   const keywords = []
    //   if (location) {
    //     keywords.push(location)
    //   }
    //   if (deviceName) {
    //     keywords.push(deviceName)
    //   }
    //   if (keywords.length) {
    //     this.$router.push({ name: 'devices', params: { filter: { keywords } } })
    //   }
    // },

    // // Service methods
    // servicesRefresh() {
    //   this.loadingServices = true
    //   post('/services/getUpdates')
    //     .then(result => {
    //       // Turn the throbber off
    //       this.loadingServices = false

    //       // Transform the headers array into a map for quick lookup.
    //       const columnNames = columnsToIndexMap(result.columns)

    //       // Convert data to maps.
    //       const serviceData = []
    //       result.services.forEach(row => serviceData.push({
    //         serviceType: row[columnNames.serviceType],
    //         status: row[columnNames.status],
    //         startTime: row[columnNames.startTime],
    //         location: row[columnNames.location] || '',
    //         deviceType: row[columnNames.deviceModelName],
    //         bayId: row[columnNames.bayId],
    //         batterySerialNumber: row[columnNames.batterySerialNumber] // Required for list linking
    //       }))

    //       // Sort by start time
    //       serviceData.sort((a, b) => b.startTime - a.startTime)

    //       this.rawServiceData = serviceData
    //     })
    // },
    // setServicesLength(value) {
    //   this.editServicesLength = value
    // },
    // openServiceSettings() {
    //   this.serviceSettingsOpen = true
    //   this.editServicesLength = this.servicesLength
    //   this.editServicesRunning = this.servicesRunning
    // },
    // saveServiceSettings() {
    //   this.serviceSettingsOpen = false
    //   this.servicesLength = this.editServicesLength
    //   this.servicesRunning = this.editServicesRunning
    //   this.saveUISettings({ path: 'dashboard.services', value: { length: this.servicesLength, running: this.servicesRunning } })
    // },
    // serviceListLink(service) {
    //   this.$router.push({
    //     name: 'services',
    //     params: { filter: {
    //       keywords: [service.batterySerialNumber],
    //       startTimeRange: [service.startTime, service.startTime]
    //     }}
    //   })
    // },

    // // Battery methods
    // batteriesRefresh() {
    //   this.loadingBatteries = true
    //   post('/batteries/getUpdates')
    //     .then(result => {
    //       // Turn the throbber off
    //       this.loadingBatteries = false

    //       // Transform the headers array into a map for quick lookup.
    //       const columnNames = columnsToIndexMap(result.columns)

    //       // Convert the data to a list of maps with the values we need.
    //       const batteryData = []
    //       result.batteries.forEach(row => batteryData.push({
    //         lastServiceTime: row[columnNames.lastServiceTime],
    //         lastServiceType: row[columnNames.lastServiceType] || '',
    //         location: row[columnNames.lastLocation] || '', // Required for the SoH chart
    //         modelName: row[columnNames.modelName],
    //         soh: row[columnNames.lastSoh], // Required for the SoH chart
    //         status: row[columnNames.lastStatus],
    //         serialNumber: row[columnNames.serialNumber] // Required for list linking
    //       }))

    //       // Sort by last service time
    //       batteryData.sort((a, b) => b.lastServiceTime - a.lastServiceTime)

    //       this.rawBatteryData = batteryData
    //     })
    // },
    // setBatteriesLength(value) {
    //   this.editBatteriesLength = value
    // },
    // openBatterySettings() {
    //   this.batterySettingsOpen = true
    //   this.editBatteriesLength = this.batteriesLength
    //   this.editBatteriesRunning = this.batteriesRunning
    // },
    // saveBatterySettings() {
    //   this.batterySettingsOpen = false
    //   this.batteriesLength = this.editBatteriesLength
    //   this.batteriesRunning = this.editBatteriesRunning
    //   this.saveUISettings({ path: 'dashboard.batteries', value: { length: this.batteriesLength, running: this.batteriesRunning } })
    // },
    // batteryListLink(battery) {
    //   this.$router.push({ name: 'batteries', params: { filter: { keywords: [battery.serialNumber] } } })
    // },

    // // News methods
    // newsRefresh() {
    //   // TODO
    //   this.newsData = [
    //     { date: 'Yesterday', title: 'C7400 Firmware 2.2.14 Released', content: 'New firmware has been released, addressing minor bugs and performance fixes. See <a href="somelink">release notes</a>.', unread: true },
    //     { date: 'Aug 21, 2018', title: 'Upcoming Maintenance', content: 'Battery Embassy will be offline June 24, from 2 AM PST to 4 AM PST for scheduled maintenance.', unread: true },
    //     { date: 'Aug 16, 2018', title: 'C5100B On Sale', content: `We're having a sale on our C5100B units until June 20th. You can save on <a href="somelink">individual units</a> as well as some <a href="somelink">great bundles</a> online! Or call our sales department at 1-800-123-4567.`, unread: true }
    //   ]
    // },
    // dismissNews(index) { // animate item closed and update news item status
    //   const newsRef = 'news-' + index
    //   let itm = this.$refs[newsRef][0]
    //   itm.style.height = itm.clientHeight + 'px'
    //   this.newsData[index].unread = false
    // },

    // // Other methods
    // // Used just to un-animate devices .item > .count arrow when moused over a sub-group of devices
    // toggleArrow(ref) {
    //   this.$refs[ref][0].classList.toggle('off')
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.experiment-list {
  table.experiments {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0px;

    thead {
      th {
        // background-color: lighten($brandBlue, 20%);
        background-color: $brandBlue;
        color: white;
        padding: 4px;
        border-right: 2px solid white;
        &:last-child {
          border-right: 0px;
        }
      }
    }

    tbody {
      tr {
        border-right: 2px solid white;
        background-color: #F0F0F0;

        &.even {
          background-color: #E0E0E0;
        }

        td {
          border-top: 3px solid white;
          border-right: 2px solid white;
          padding: 5px;
          text-align: left;
          font-size: smaller;

          &:last-child {
            border-right: 0px;
          }

          &.center {
            text-align: center;
          }
        }

        &.deets > td {
          border-top: 1px solid white;
          padding: 10px;

          div.description {
            font-style: italic;
            font-size: smaller;
            margin-bottom: 5px;
          }
        }
      }
    }
  }

  table.branches {
    border-collapse: separate;
    border-spacing: 1px;

    thead {
      th {
        border: none;
      }
    }

    tbody {
      tr {
        background-color: #E0E0E0;
      }

      &.even {
        tr {
          background-color: #D0D0D0;
        }
      }

      tr {
        td {
          border: none;
          text-align: center;
        }
      }
    }
  }

  i {
    padding: 0 5px;
    cursor: pointer;

    &.fa-chevron-up, &.fa-chevron-down, &.fa-plus {
      transition: all 0.5s;

      &:hover {
        color: $brandBlue;
      }
    }

    &.fa-check { color: $brandGreen; }
    &.fa-times { color: $brandRed; }
  }
}
</style>
