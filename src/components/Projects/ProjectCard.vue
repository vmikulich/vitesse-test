<template>
  <div class="card-wrapper">
    <div class="chip-wrapper">
      <v-menu
        v-model="toggleStatusButton"
        bottom
        left
        :offset-y="true"
        :close-on-content-click="true"
      >
        <template #activator="{ on, attr }">
          <v-chip
            class="font-weight-bold project-status text-capitalize text--secondary"
            :class="projectStatus"
            outlined
            small
            v-bind="attr"
            v-on="on"
          >
            {{ projectStatus }}
          </v-chip>
        </template>
        <v-btn
          depressed
          large
          elevation="4"
          class="rounded-sm d-block"
          @click.stop="toggleStatus(card.id)"
        >
          {{ statusButtonActionName }} project
        </v-btn>
      </v-menu>
    </div>
    <v-card
      :class="{ 'closed-card': isClosed }"
      :disabled="isClosed"
    >
      <v-card-title class="pt-4 pb-0 flex-nowrap">
        <v-img
          v-if="card.pictureUrl"
          :src="card.pictureUrl"
          width="50"
          height="50"
          max-width="50"
          class="mr-4 rounded"
        ></v-img>
        <v-avatar v-else size="50" rounded class="mr-4">
          <v-icon size="40">
            mdi-image-off-outline
          </v-icon>
        </v-avatar>
        <div class="d-flex mr-12 pr-4">
          <p
            class="project-title my-auto truncate-overflow text-body-1 font-weight-medium"
            :class="{ 'text--secondary': isClosed }"
            :title="card.name"
          >
            {{ card.name }}
          </p>
        </div>
        <v-spacer />
      </v-card-title>
      <v-card-text>
        <div class="project-description truncate-overflow mt-3">
          <p class="text--secondary text-body-2 text-break my-0">
            {{ card.description }}
          </p>
        </div>
        <div
          v-if="!isClosed"
          class="d-flex rounded overflow-hidden project-progress mt-3"
        >
          <v-tooltip
            v-for="group in card.caseGroups"
            :key="group.caseStatus"
            bottom
          >
            <template v-slot:activator="{ on, attrs }">
              <div
                v-bind="attrs"
                class="flex-grow-1 case-progress"
                :class="caseStatuses[group.caseStatus]"
                :style="{
                  'flex-basis': caseFlexBasis(group.caseCount, card.casesTotal),
                  order: group.caseStatus,
                }"
                v-on="on"
              ></div>
            </template>
            <span>
              {{ group.caseCount }} {{ caseWordForm(group.caseCount) }}
            </span>
          </v-tooltip>
        </div>
      </v-card-text>
      <v-card-actions v-if="!isClosed" class="px-4 pt-0">
        <v-spacer></v-spacer>
        <span class="text--secondary text-caption font-weight-medium">
          {{ card.casesTotal }}
          {{ caseWordForm(card.casesTotal) }}
        </span>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {
  PROJECT_STATUSES_NAMES as projectStatuses,
  CASE_STATUSES_NAMES as caseStatuses,
} from '~/constants/index'

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle'])

const toggleStatusButton = ref<boolean>(false)

const projectStatus = computed(() => projectStatuses[props.card.status])
const isClosed = computed(() => projectStatus.value === 'closed')
const statusButtonActionName = computed(() => isClosed.value ? 'Reopen' : 'Close')

const caseFlexBasis = (count: number, total: number): string => {
  return `${(count * 100) / total}%`
}

const toggleStatus = (projectId: number) => {
  emit('toggle', projectId, !isClosed.value)
  toggleStatusButton.value = false
}

const caseWordForm = (casesCount: number) => {
  return casesCount === 1 ? ' case' : ' cases'
}
</script>

<style lang="scss" scoped>
.project-title {
  max-height: 50px;
  word-break: break-all;
  word-break: break-word;
}
.project-description {
  height: 40px;
  word-break: break-all;
  word-break: break-word;
}
.truncate-overflow {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
.chip-wrapper .v-chip {
  border-radius: 4px;
}
.chip-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 50;
}
.project-status.closed {
  color: #838daa;
  border-color: #838daa;
}
.case-progress.ongoing,
.project-status.ongoing {
  color: #0c2a5c;
  border-color: #0c2a5c;
}
.case-progress.created,
.project-status.created {
  color: #f4ae69;
}
.case-progress.problem,
.project-status.problem {
  color: #f56a53;
  border-color: #f56a53;
}
.case-progress.running,
.project-status.running {
  color: #3d82f0;
  border-color: #3d82f0;
}
.case-progress.finished,
.project-status.finished {
  color: #00a978;
  border-color: #00a978;
}
.case-progress {
  border-bottom-width: 8px;
  border-bottom-style: solid;
}
.project-progress {
  min-height: 8px;
  background-color: #d9e3f1;
}
.v-chip.project-status {
  font-size: 10px;
  padding: 0 8px;
}
.status-btn {
  position: absolute;
  top: 100%;
  right: 0;
}
.helios-theme .theme--light .v-card.closed-card {
  background: transparent;
  border: 2px solid #838daa4b;
  box-shadow: none;
}
.card-wrapper {
  position: relative;
}
</style>
