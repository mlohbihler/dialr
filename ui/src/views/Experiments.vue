<!-- Copyright Serotonin Software 2019 -->
<template>
  <div>
    <Loading v-if="!loaded"/>
    <div class="experiment-list">
      <p>You have {{ experimentCountText }}.</p>
      <table class="experiments">
        <thead>
          <th></th>
          <th>UUID</th>
          <th>Title</th>
          <th>Running</th>
          <th>TTL</th>
          <th>Hits</th>
          <th></th>
        </thead>
        <tbody>
          <template v-for="(exp, expIndex) in experiments">
            <tr :key="exp.uuid + '-head'" :class="[getRowParity(expIndex), exp.expanded ? 'open' : 'closed']">
              <td class="center"><i :class="getToggleClasses(exp)" :title="exp.expanded ? 'close' : 'open'" @click="toggleRow(exp)"></i></td>
              <td><ClipboardCopy v-if="exp.uuid" :str="exp.uuid">{{ exp.uuid }}</ClipboardCopy></td>
              <td>{{ exp.title }}</td>
              <td class="center"><i v-if="exp.running" class="fa fa-check" title="running"></i></td>
              <td class="center">{{ exp.requestTtl }}s</td>
              <td class="center">{{ exp.hits }}</td>
              <td>
                <template v-if="isEditingExperiment(expIndex)">
                  <i class="fa fa-save" @click="saveExperimentEdit" title="save"></i>
                  <i class="fa fa-times" @click="cancelExperimentEdit" title="cancel"></i>
                  <i class="fa fa-trash" v-if="exp.uuid" @click="deleteExperiment" title="delete"></i>
                </template>
                <template v-else>
                  <i class="fa fa-sync" @click="refreshExperiment(expIndex)" title="refresh"></i>
                  <i class="fa fa-edit" @click="editExperiment(expIndex)" title="edit"></i>
                </template>
              </td>
            </tr>
            <tr :key="exp.uuid + '-deets'" v-if="exp.expanded" :class="[getRowParity(expIndex), 'deets']">
              <td colspan="7">
                <div v-if="isEditingExperiment(expIndex)" class="experiment-edit">
                  <!-- Edit the experiment -->
                  <div v-if="editExperimentError" class="error-message">{{ editExperimentError }}</div>
                  <FormText label="Title" required type="text" placeholder="Title of the experiment" v-model="editExperimentTitle"
                      :errorMsg="editExperimentTitleError"/>
                  <FormCheck label="Running" required placeholder="Is this experiment currently running" v-model="editExperimentRunning"/>
                  <FormText label="Request TTL" required type="text" v-model="editExperimentTtl" :errorMsg="editExperimentTtlError"
                      hint="The max amount of time in seconds that requests are expected to last"/>
                  <FormTextArea label="Description" :rows="5" placeholder="Long description of the experiment" classes="description-text"
                      v-model="editExperimentDescription" :errorMsg="editExperimentDescriptionError"/>
                </div>
                <template v-else>
                  <!-- View the branches -->
                  <div class="description" v-if="exp.description">{{ exp.description }}</div>
                  <div v-if="isEditingBranch(expIndex) && editBranchError" class="error-message">{{ editBranchError }}</div>
                  <div class="branches">
                    <table class="branches">
                      <thead>
                        <th>Branch</th>
                        <th>Probability</th>
                        <th>Filter</th>
                        <th>Last used</th>
                        <th></th>
                      </thead>
                      <tbody :class="getRowParity(expIndex)">
                        <tr v-for="(branch, branchIndex) in exp.branches" :key="branch.value">
                          <template v-if="isEditingBranch(expIndex, branchIndex)">
                            <!-- Edit the branch -->
                            <td><input type="text" class="branch-input" v-model="editBranchValue" size="1" maxlength="10"/></td>
                            <td>
                              <input type="text" class="probability-input" v-model="editBranchProbability" size="1" @blur="fixProbability"/>
                              <div class="stack">
                                <i class="fa fa-angle-up" @click="incrementProbability" title="increment"></i>
                                <i class="fa fa-angle-down" @click="decrementProbability" title="decrement"></i>
                              </div>
                            </td>
                            <td><input type="text" class="filter-input" v-model="editBranchFilter" size="30"/></td>
                            <td>{{ branch.lastUsed ? `${since(branch.lastUsed)} ago` : '(never)' }}</td>
                            <td>
                              <i class="fa fa-save" @click="saveBranchEdit" title="save"></i>
                              <i class="fa fa-times" @click="cancelBranchEdit" title="cancel"></i>
                              <i class="fa fa-trash" @click="deleteBranch" title="delete"></i>
                            </td>
                          </template>
                          <template v-else>
                            <!-- View the branch -->
                            <td>{{ branch.value }}</td>
                            <td>{{ branch.probability }}</td>
                            <td>{{ branch.filter }}</td>
                            <td>{{ branch.lastUsed ? `${since(branch.lastUsed)} ago` : '(never)' }}</td>
                            <td><i class="fa fa-edit" @click="editBranch(expIndex, branchIndex)" title="edit"></i></td>
                          </template>
                        </tr>
                        <tr><td colspan="5"><i class="fa fa-plus" @click="addBranch(expIndex)" title="add another branch"></i></td></tr>
                      </tbody>
                    </table>
                  </div>
                </template>
              </td>
            </tr>
          </template>
          <tr v-if="!isEditingExperiment()" :class="[getRowParity(experiments.length)]">
            <td colspan="7" class="center"><i class="fa fa-plus" @click="addExperiment" title="add another experiment"></i></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ClipboardCopy from '@/components/ClipboardCopy'
import FormTextArea from '../components/FormTextArea'
import FormCheck from '../components/FormCheck'
import FormText from '../components/FormText'
import Loading from '@/components/Loading'

import { dele, get, post, put } from '@/api'
import { cloneDeep } from 'lodash'
// import { mapActions, mapGetters } from 'vuex'
import { plural, since } from '@/util'

export default {
  components: { ClipboardCopy, FormCheck, FormText, FormTextArea, Loading },
  data() {
    return {
      loaded: false,
      experiments: [],

      // Experiment editing
      editingExperiment: null,
      editExperimentTitle: '',
      editExperimentTitleError: null,
      editExperimentRunning: false,
      editExperimentTtl: '',
      editExperimentTtlError: null,
      editExperimentDescription: '',
      editExperimentDescriptionError: null,
      editExperimentError: null,

      // Branch editing
      editingBranch: null,
      editBranchValue: '',
      editBranchProbability: 0,
      editBranchFilter: '',
      editBranchError: null
    }
  },
  async mounted() {
    const result = await get('/experiments')

    result.experiments.forEach(e => {
      // Add an expanded attribute to each row
      e.expanded = false
      this.experiments.push(e)
    })

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
  },
  methods: {
    getToggleClasses(exp) {
      return ['fa', `fa-chevron-${exp.expanded ? 'up' : 'down'}`]
    },
    getRowParity(index) {
      return index % 2 === 0 ? 'even' : 'odd'
    },
    toggleRow(exp) {
      exp.expanded = !exp.expanded
    },
    since(date) {
      return since(new Date(date))
    },

    //
    // Experiment management
    addExperiment() {
      this.experiments.push({
        title: '',
        running: false,
        requestTtl: 30,
        description: '',
        hits: 0,
        branches: [
          { value: 'a', probability: 1 },
          { value: 'b', probability: 0 }
        ]
      })
      this.editExperiment(this.experiments.length - 1)
    },
    editExperiment(expIndex) {
      this.cancelExperimentEdit()
      this.cancelBranchEdit()

      this.editingExperiment = expIndex
      const exp = this.experiments[expIndex]
      exp.expanded = true

      this.editExperimentTitle = exp.title
      this.editExperimentRunning = exp.running
      this.editExperimentTtl = '' + exp.requestTtl
      this.editExperimentDescription = exp.description
    },
    deleteExperiment() {
      if (confirm('Do you really want to delete this experiment?')) {
        dele(`/experiments/${this.experiments[this.editingExperiment].uuid}`)
        this.experiments.splice(this.editingExperiment, 1)
        this.editingExperiment = null
      }
    },
    async refreshExperiment(expIndex) {
      this.loaded = false
      const result = await get(`/experiments/${this.experiments[expIndex].uuid}`)
      this.updateExperimentData(result, expIndex)
      this.loaded = true
    },
    updateExperimentData(exp, expIndex) {
      exp.expanded = this.experiments[expIndex].expanded
      this.experiments.splice(expIndex, 1, exp)
    },
    isEditingExperiment(expIndex) {
      if (expIndex === undefined) {
        return this.editingExperiment !== null
      }
      return this.editingExperiment === expIndex
    },
    cancelExperimentEdit() {
      if (this.editingExperiment !== null) {
        // If a new experiment was being edited, it needs to be deleted.
        const exp = this.experiments[this.editingExperiment]
        if (!exp.uuid) {
          this.experiments.pop()
        }
        this.editingExperiment = null
      }
    },
    async saveExperimentEdit() {
      this.loaded = false
      this.editExperimentError = null
      this.editExperimentTitleError = null
      this.editExperimentTtlError = null
      this.editExperimentDescriptionError = null

      const exp = cloneDeep(this.experiments[this.editingExperiment])
      exp.title = this.editExperimentTitle.trim()
      exp.running = this.editExperimentRunning
      exp.requestTtl = parseInt(this.editExperimentTtl)
      exp.description = this.editExperimentDescription.trim()

      const fn = exp.uuid ? put : post
      const result = await fn('/experiments', exp)

      this.loaded = true
      if (result.error) {
        if (result.error.code === 'experiments-upsert-3') {
          this.editExperimentTtlError = 'Invalid value'
        } else if (result.error.code === 'experiments-upsert-5') {
          this.editExperimentTitleError = 'Must be 1-32 characters'
        } else if (result.error.code === 'experiments-upsert-6') {
          this.editExperimentDescriptionError = 'Cannot be longer than 1000 characters'
        } else if (result.error.code === 'experiments-upsert-7') {
          this.editExperimentTtlError = 'Cannot be greater than 600 (10 minutes)'
        } else {
          this.editExperimentError = result.error.message
        }
      } else {
        result.expanded = exp.expanded
        this.experiments.splice(this.editingExperiment, 1, result)
        this.editingExperiment = null
      }
    },

    //
    // Branch management
    addBranch(expIndex) {
      const exp = this.experiments[expIndex]
      exp.branches.push({ value: '', probability: 0 })
      this.editBranch(expIndex, exp.branches.length - 1)
    },
    editBranch(expIndex, branchIndex) {
      this.cancelExperimentEdit()
      this.cancelBranchEdit()

      this.editingBranch = { expIndex, branchIndex }
      const branch = this.experiments[expIndex].branches[branchIndex]
      this.editBranchValue = branch.value
      this.editBranchProbability = branch.probability
      this.editBranchFilter = branch.filter
    },
    async deleteBranch() {
      if (confirm('Do you really want to delete this branch?')) {
        const exp = cloneDeep(this.experiments[this.editingBranch.expIndex])
        exp.branches.splice(this.editingBranch.branchIndex, 1)
        await this.saveBranch(exp)
      }
    },
    isEditingBranch(expIndex, branchIndex) {
      if (branchIndex === undefined) {
        return this.editingBranch && expIndex === this.editingBranch.expIndex
      }
      return this.editingBranch && expIndex === this.editingBranch.expIndex && branchIndex === this.editingBranch.branchIndex
    },
    cancelBranchEdit() {
      if (this.editingBranch) {
        // If a new branch was being edited, it needs to be deleted.
        const exp = this.experiments[this.editingBranch.expIndex]
        const branch = exp.branches[this.editingBranch.branchIndex]
        if (!branch.value) {
          exp.branches.pop()
        }
        this.editingBranch = null
      }
    },
    fixProbability() {
      this.editBranchProbability = parseInt(this.editBranchProbability)
      if (isNaN(this.editBranchProbability)) {
        this.editBranchProbability = 0
      }
    },
    incrementProbability() {
      this.editBranchProbability++
    },
    decrementProbability() {
      if (this.editBranchProbability > 0) {
        this.editBranchProbability--
      }
    },
    async saveBranchEdit() {
      const exp = cloneDeep(this.experiments[this.editingBranch.expIndex])
      const branch = exp.branches[this.editingBranch.branchIndex]
      branch.value = this.editBranchValue.trim()
      branch.probability = this.editBranchProbability
      branch.filter = (this.editBranchFilter && this.editBranchFilter.trim()) || ''
      await this.saveBranch(exp, this.editingBranch.expIndex)
    },
    async saveBranch(exp) {
      this.loaded = false
      this.editBranchError = null

      const result = await put('/experiments', exp)

      this.loaded = true
      if (result.error) {
        if (result.error.code === 'experiments-upsert-10') {
          this.editBranchError = 'All branches must have a value'
        } else if (result.error.code === 'experiments-upsert-11') {
          this.editBranchError = 'Branch values must be between 1 and 10 characters'
        } else if (result.error.code === 'experiments-upsert-14') {
          this.editBranchError = 'All branch values must be unique'
        } else if (result.error.code === 'experiments-upsert-15') {
          this.editBranchError = 'You must have an unfiltered branch'
        } else {
          this.editBranchError = result.error.message
        }
      } else {
        result.expanded = exp.expanded
        this.experiments.splice(this.editingBranch.expIndex, 1, result)
        this.editingBranch = null
      }
    }
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
        border-right: 1px solid white;
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
          border-right: 1px solid white;
          padding: 5px;
          text-align: left;
          font-size: 11px;

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
            font-size: 11px;
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
        text-align: center;
      }
    }

    tbody {
      tr {
        background-color: #E0E0E0;

        td {
          border: none;
          text-align: center;
        }
      }

      &.even {
        tr {
          background-color: #D0D0D0;
        }
      }
    }
  }

  i {
    padding: 0 5px;
    cursor: pointer;
    transition: all 0.5s;

    &.fa-chevron-up, &.fa-chevron-down, &.fa-plus, &.fa-edit, &.fa-save, &.fa-angle-up, &.fa-angle-down, &.fa-sync {
      &:hover {
        color: $brandBlue;
      }
    }

    &.fa-trash, &.fa-times {
      &:hover {
        color: $brandRed;
      }
    }

    &.fa-check {
      cursor: inherit;
    }
  }
}

.branch-input {
  text-align: center;
}

.probability-input {
  text-align: right;
  padding-right: 3px;
}

.filter-input {
  padding-left: 3px;
  padding-right: 3px;
}

.stack {
  display: inline-block;
  vertical-align: bottom;

  i {
    display: block;
    padding: 0 2px;
    font-size: 10.5px
  }
}

.experiment-edit {
  font-size: 16px;
}
</style>
