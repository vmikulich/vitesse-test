<template>
  <v-container v-if="showTemplate" fluid fill-height>
    <v-container fluid shrink>
      <v-card>
        <v-card-text class="d-flex">
          <v-row>
            <v-col cols="12" md="6">
              <div class="d-flex py-2 text-body-1 text-truncate">
                <router-link
                  :to="{ name: 'projects' }"
                  class="text--secondary text-decoration-none"
                >
                  Projects
                </router-link>
                <span class="mx-1">/</span>
                <router-link
                  to="/"
                  class="text--secondary text-decoration-none"
                  v-text="project.name"
                ></router-link>
                <span class="mx-1">/</span>
                <span class="primary--text" v-text="caseEntity.name"></span>
                <CaseStatus class="ml-8" :status="caseEntity.status" />
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-md-end">
              <v-btn
                v-if="canEdit"
                type="button"
                class="ml-md-2 pl-2 pr-3"
                :class="disabledValidate == false ? 'primary' : ''"
                color
                text
                large
                :loading="validatting"
                :disabled="disabledValidate"
                @click="validateCase()"
              >
                <v-icon v-if="disabledValidate" class="mr-2">
                  mdi-check-circle
                </v-icon>
                <v-icon v-else class="mr-2">mdi-circle-outline</v-icon>
                {{ disabledValidate ? 'Valid Geometry' : 'Validate Geometry' }}
              </v-btn>
              <v-btn
                v-if="canEdit"
                type="button"
                class="ml-4"
                color="primary"
                elevation="0"
                large
                :loading="submitting"
                :disabled="disabledSubmit"
                @click="addMeshingDialog = true"
              >
                Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
    <v-container fluid grow class="setup-container">
      <v-row class="setup-main flex-md-nowrap">
        <v-col cols="12" md="3" class="region-column d-flex flex-column">
          <v-card class="d-flex flex-column">
            <v-toolbar flat class="py-0 shrink" dense>
              <v-toolbar-title class="text-body-1 font-weight-bold">
                Regions
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                v-if="!options.disableAll"
                icon
                color="accent"
                small
                class="mr-0"
                @click.stop="addRegionDialog = true"
              >
                <v-icon small>mdi-plus</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text
              v-if="caseSetup.regions && caseSetup.regions.length"
              class="py-0 px-0"
            >
              <v-treeview
                :items="tree"
                :active.sync="activeRegion"
                activatable
                hoverable
                dense
                return-object
                expand-icon="mdi-chevron-down"
                @update:active="updateActive($event[0])"
              >
                <template #label="{ item, active }">
                  <span
                    :class="{ 'font-weight-bold': active }"
                    v-text="item.name"
                  ></span>
                </template>
                <template #prepend="{ item }">
                  <v-icon v-if="item.type === 'region'" size="18">
                    $vuetify.icons.region
                  </v-icon>
                  <v-icon v-else-if="item.type === 'boundary'" size="18">
                    $vuetify.icons.boundary
                  </v-icon>
                  <v-icon v-else-if="item.type === 'subregion'" size="18">
                    $vuetify.icons.region
                  </v-icon>
                </template>
                <template #append="{ item }">
                  <v-btn icon small @click.stop="toggleVisibility(item)">
                    <v-icon small>
                      {{ item.isVisible ? 'mdi-eye' : 'mdi-eye-off' }}
                    </v-icon>
                  </v-btn>
                  <v-icon
                    v-if="isValidNode(item)"
                    size="12"
                    class="success--text mr-4"
                  >
                    mdi-check
                  </v-icon>
                  <v-icon v-else class="mr-4" size="12">mdi-pencil</v-icon>
                </template>
              </v-treeview>
            </v-card-text>
            <v-card-text v-else class="d-flex grow">
              <div class="text-center mx-auto my-auto">
                <p class="font-weight-bold text--primary">
                  Upload a STEP file
                </p>
                <p>
                  A STEP file consists of solid volumes as regions and surfaces
                  as boundaries
                </p>
                <v-btn
                  v-if="!options.disableAll"
                  class="mt-2"
                  type="button"
                  color="primary"
                  elevation="0"
                  large
                  @click.stop="addStepDialog = true"
                >
                  Upload STEP
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card
            v-if="
              (caseSetup.regions && caseSetup.regions.length >= 2) ||
                (caseSetup.interfaces && caseSetup.interfaces.length)
            "
            class="d-flex flex-column"
          >
            <v-toolbar flat class="py-0 shrink" dense>
              <v-toolbar-title class="text-body-1 font-weight-bold">
                Interfaces
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                v-if="!options.disableAll"
                icon
                color="accent"
                small
                class="mr-0"
                @click="addInterfaceDialog = true"
              >
                <v-icon small>mdi-plus</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text
              v-if="caseSetup.interfaces && caseSetup.interfaces.length"
              class="px-0 py-0"
            >
              <v-treeview
                :items="interfaces"
                :active.sync="activeInterface"
                item-key="index"
                activatable
                hoverable
                dense
                return-object
                expand-icon="mdi-chevron-down"
                @update:active="updateActive($event[0])"
              >
                <template #label="{ item, active }">
                  <span
                    :class="{ 'font-weight-bold': active }"
                    v-text="item.name"
                  >
                  </span>
                </template>
                <template #prepend="{}">
                  <v-icon size="18">
                    $vuetify.icons.interface
                  </v-icon>
                </template>
                <template #append="{ item }">
                  <v-icon
                    v-if="isValidNode(item)"
                    size="12"
                    class="success--text"
                  >
                    mdi-check
                  </v-icon>
                  <v-icon v-else size="12">mdi-pencil</v-icon>
                </template>
              </v-treeview>
            </v-card-text>
            <v-card-text v-else class="d-flex grow">
              <v-btn
                v-if="!options.disableAll"
                class="mx-auto my-auto"
                type="button"
                color="primary"
                elevation="0"
                large
                @click.stop="addInterfaceDialog = true"
              >
                Add interface
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" :md="activeNode ? 5 : 9" class="setup-column">
          <div v-if="config.debug" style="position: absolute; z-index: 1">
            <v-btn
              x-small
              outlined
              color="accent"
              @click="
                showData = !showData,
                showErrors = false
              "
            >
              Data
            </v-btn>
            <v-btn
              x-small
              outlined
              color="error"
              @click="
                showErrors = !showErrors,
                showData = false
              "
            >
              Errors
            </v-btn>
          </div>
          <STLReader
            v-if="files.length"
            :class="{ 'd-none': showErrors || showData }"
            :files="files"
            :visible="visible"
            @screenshot="screenCapture"
            @error="handleError"
          />

          <!-- <screenshot-dialog /> -->

          <div
            v-if="showData || showErrors"
            class="pt-8"
            style="overflow: auto; height: 100%"
          >
            <pre v-if="showData">{{ JSON.stringify(caseSetup, null, 2) }}</pre>
            <template v-if="showErrors">
              <v-alert
                v-for="(error, index) in ajvErrors"
                :key="index"
                color="error"
                tile
                style="overflow-x: auto"
              >
                <pre style="overflow-x: auto">{{
                  JSON.stringify(error, null, 2)
                }}</pre>
              </v-alert>
            </template>
          </div>
        </v-col>
        <!-- <v-col cols="12" :md="activeNode ? 4 : 0" class="setup-column">
          <JsonSchema
            v-if="activeNode"
            :model="caseSetup"
            :schema="schema"
            :options="options"
            :active-node="activeNode"
            @error="handleError"
            @change="updateActiveEntity"
            @delete="confirmDeleteEntity"
            @boundary="addBoundaryDialog = true"
            @subregion="addSubregionDialog = true"
            @optimization="addOptimization"
          />
        </v-col> -->
      </v-row>

      <v-dialog v-model="addStepDialog" persistent max-width="420px" scrollable>
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">
              Populate case from STEP
            </span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              :disabled="loading"
              @click="addStepDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form
              ref="step"
              class="mt-2"
              lazy-validation
              @submit.prevent="addStep"
            >
              <v-file-input
                v-model="step.file"
                label="Select step file"
                prepend-icon="$region"
                required
                outlined
                show-size
                :accept="accept"
              >
              </v-file-input>
            </v-form>
          </v-card-text>
          <p class="text-caption ml-10 mr-10 mb-0">
            This can take some time, please stand by while we are processing the
            file in the background.
          </p>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.step.$invalid"
              :loading="loading"
              @click="addStep"
            >
              Populate case
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="addRegionDialog"
        max-width="420px"
        scrollable
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">Add Region</span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              :disabled="loading"
              @click="addRegionDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form
              ref="region"
              class="mt-2"
              lazy-validation
              @submit.prevent="addRegion"
            >
              <v-text-field
                v-model.trim="region.name"
                label="Region name *"
                name="region-name"
                autocomplete="off"
                required
                outlined
                :maxlength="255"
                :error-messages="getErrors('region-name', $v.region.name)"
                @blur="$v.region.name.$touch()"
              ></v-text-field>
              <v-file-input
                v-model="region.stl"
                counter
                label="Select region *"
                prepend-icon="$region"
                required
                outlined
                chips
                show-size
                :accept="accept"
                :error-messages="getErrors('region-stl', $v.region.stl)"
                @blur="debouncedBlur($v.region.stl)"
              >
              </v-file-input>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.region.$invalid"
              :loading="loading"
              @click="addRegion"
            >
              Add Region
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="addSubregionDialog"
        max-width="420px"
        scrollable
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">Add Subregion</span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              :disabled="loading"
              @click="addSubregionDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form
              ref="subregion"
              class="mt-2"
              lazy-validation
              @submit.prevent="addSubregion"
            >
              <v-text-field
                v-model.trim="subregion.name"
                label="Subregion name *"
                name="subregion-name"
                autocomplete="off"
                required
                outlined
                :maxlength="255"
                :error-messages="getErrors('subregion-name', $v.subregion.name)"
                @blur="$v.subregion.name.$touch()"
              ></v-text-field>
              <v-file-input
                v-model="subregion.stl"
                counter
                label="Select subregion *"
                prepend-icon="$region"
                required
                outlined
                chips
                show-size
                :accept="accept"
                :error-messages="getErrors('subregion-stl', $v.subregion.stl)"
                @blur="debouncedBlur($v.subregion.stl)"
              >
              </v-file-input>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.subregion.$invalid"
              :loading="loading"
              @click="addSubregion"
            >
              Add Subregion
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="addBoundaryDialog"
        max-width="420px"
        scrollable
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">Add Boundary</span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              :disabled="loading"
              @click="addBoundaryDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form
              ref="boundary"
              class="mt-2"
              lazy-validation
              @submit.prevent="addBoundary"
            >
              <v-text-field
                v-model.trim="boundary.name"
                label="Boundary name *"
                name="boundary-name"
                autocomplete="off"
                required
                outlined
                :maxlength="255"
                :error-messages="getErrors('boundary-name', $v.boundary.name)"
                @blur="$v.boundary.name.$touch()"
              ></v-text-field>
              <v-file-input
                v-model="boundary.stl"
                counter
                label="Select boundary *"
                prepend-icon="$boundary"
                required
                outlined
                chips
                show-size
                :accept="accept"
                :error-messages="getErrors('boundary-stl', $v.boundary.stl)"
                @blur="debouncedBlur($v.boundary.stl)"
              >
              </v-file-input>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.boundary.$invalid"
              :loading="loading"
              @click="addBoundary"
            >
              Add Boundary
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="addInterfaceDialog" max-width="420px" scrollable>
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">Add Interface</span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              @click="addInterfaceDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form
              ref="interface_"
              class="mt-2"
              lazy-validation
              @submit.prevent="addInterface"
            >
              <v-select
                v-model="interface_.r1"
                :items="
                  (caseSetup.regions || []).filter(
                    (option) => interface_.r2 !== option.id
                  )
                "
                item-text="name"
                item-value="id"
                label="First region"
                outlined
                required
                clearable
                :error-messages="getErrors('interface-r1', $v.interface_.r1)"
                @blur="$v.interface_.r1.$touch()"
              ></v-select>
              <v-select
                v-model="interface_.r2"
                :items="
                  (caseSetup.regions || []).filter(
                    (option) => interface_.r1 !== option.id
                  )
                "
                item-text="name"
                item-value="id"
                label="Second region"
                outlined
                required
                clearable
                :error-messages="getErrors('interface-r2', $v.interface_.r2)"
                @blur="$v.interface_.r2.$touch()"
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.interface_.$invalid"
              :loading="loading"
              @click="addInterface"
            >
              Add Interface
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="addMeshingDialog" max-width="420px" scrollable>
        <v-card>
          <v-card-title>
            <span class="headline font-weight-medium">Resolution level</span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              @click="addMeshingDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <p
              v-text="
                schema.properties.settings.properties.meshing.properties
                  .resolution.description
              "
            ></p>
            <v-form
              ref="meshing"
              class="mt-2"
              lazy-validation
              @submit.prevent="addMeshing"
            >
              <v-radio-group v-model="meshing.resolution" mandatory>
                <v-card v-if="caseEntity.type === 1" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Conceptual_15" label="Conceptual 15" />
                    <p class="text--secondary my-0">
                      15 credits. Runtime of 1 day. Good first estimation and
                      fast results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 1" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Detailed_100" label="Detailed 100" />
                    <p class="text--secondary my-0">
                      100 credits. Runtime of 1 day. Very accurate and detailed
                      results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 1" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Detailed_50" label="Detailed 50" />
                    <p class="text--secondary my-0">
                      50 credits. Runtime of 2 days. Very accurate and detailed
                      results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 1" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Detailed_15" label="Detailed 15" />
                    <p class="text--secondary my-0">
                      15 credits. Runtime of 7 days. Very accurate and detailed
                      results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 0" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Detailed_100" label="Detailed 100" />
                    <p class="text--secondary my-0">
                      100 credits. Runtime of 4 weeks. Very accurate and
                      detailed results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 0" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Conceptual_100" label="Conceptual 100" />
                    <p class="text--secondary my-0">
                      100 credits. Runtime of 2 weeks. Good first estimation and
                      fast results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 0" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Conceptual_85" label="Conceptual 85" />
                    <p class="text--secondary my-0">
                      85 credits. Runtime of 2 weeks and 2 days. Good first
                      estimation and fast results.
                    </p>
                  </v-card-text>
                </v-card>
                <v-card v-if="caseEntity.type === 0" class="mb-4">
                  <v-card-text class="px-4 py-4">
                    <v-radio value="Detailed_85" label="Detailed 85" />
                    <p class="text--secondary my-0">
                      85 credits. Runtime of 4 weeks and 4 days. Very accurate
                      and detailed results.
                    </p>
                  </v-card-text>
                </v-card>
              </v-radio-group>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :disabled="$v.meshing.$invalid"
              @click="addMeshing"
            >
              Ok
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="deleteDialog" max-width="420px" scrollable>
        <v-card v-if="entityToDelete">
          <v-card-title>
            <span class="headline font-weight-medium">
              Delete {{ entityToDelete.type }}
            </span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              @click="deleteDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <div class="d-flex text-body-2 font-weight-bold align-center mb-6">
              <v-icon color="warning" class="mt-1">mdi-alert</v-icon>
              <div class="ml-4 warning--text">
                <p class="my-0">
                  Are you sure you want to delete
                  {{ entityToDelete.type }} &ldquo;{{
                    entityToDelete.name
                  }}&rdquo;?
                </p>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-row>
              <v-col cols="6">
                <v-btn
                  type="button"
                  color="primary"
                  large
                  outlined
                  block
                  @click="deleteDialog = false"
                >
                  Cancel
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  type="button"
                  color="primary"
                  large
                  block
                  elevation="0"
                  :loading="deleting"
                  @click="deleteEntity(entityToDelete.type)"
                >
                  Yes
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="addMessagesDialog"
        max-width="420px"
        scrollable
        persistent
      >
        <v-card>
          <v-card-title>
            <span
              v-if="errorMessages.length > 0"
              class="headline font-weight-medium"
            >
              Error in the geometry file
            </span>
            <span v-else class="headline font-weight-medium">
              Warning for the geometry file
            </span>
            <v-btn
              type="button"
              class="ml-auto mt-n4"
              icon
              :disabled="loading"
              @click="addMessagesDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-alert
              v-for="item in messages"
              :key="item.id"
              text
              :type="item.severity"
              class="mb-4"
              outlined
            >
              <p class="mb-0">
                {{ item.message }}
              </p>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn
              type="button"
              color="primary"
              block
              large
              elevation="0"
              :loading="loading"
              @click="addMessagesDialog = false"
            >
              Got it
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import RefParser from '@apidevtools/json-schema-ref-parser'
import Ajv from 'ajv'
import config from '../../../../../config'
import STLReader from '~/components/STLReader.vue'
// import ScreenshotDialog from '~/components/Paraview/core/Screenshots/ScreenshotDialog/index.vue'
import useUser from '~/use/useUser'
import useProject from '~/use/useProject'
import useCase from '~/use/useCase'
import { ICase, ICaseSetup, ICaseFile } from '~/interfaces/cases'
import axios from 'axios'

const router = useRouter()
const store = useStore()
const { canEdit } = useUser()
const { fetchProject, project } = useProject()
const {
  fetchCase,
  fetchCaseSetup,
  fetchCaseFiles,
  currentCase,
  currentCaseSetup,
  currentCaseFiles,
} = useCase()

const ajv = new Ajv({ allErrors: true })
const accept = '.step,.stp'

const showTemplate = ref(false)

const caseSetup = ref<ICaseSetup>(null)
const caseEntity = ref<ICase>(null)
const files = ref<ICaseFile[]>([])

const params = defineProps({
  projectId: {
    type: String,
  },
  caseId: {
    type: String,
  },
})

onMounted(async() => {
  try {
    const requests: Promise<void>[] = [
      fetchCaseSetup(params.caseId),
      fetchCaseFiles(params.caseId),
    ]
    if (!project.value) {
      requests.unshift(fetchProject(params.projectId))
    }
    if (!currentCase.value) {
      requests.unshift(fetchCase(params.caseId))
    }

    await Promise.all(requests)

    caseSetup.value = currentCaseSetup.value
    caseEntity.value = currentCase.value
    files.value = currentCaseFiles.value

    // const schema = await RefParser.dereference(rawSchema)

    caseSetup.value.settings = caseSetup.value.settings || {}
    caseSetup.value.regions = caseSetup.value.regions || []
    caseSetup.value.interfaces = caseSetup.value.interfaces || []

    showTemplate.value = true
  } catch (e) {
    console.log(e)
  }
})

const schema = ref({})
const loading = ref(false)
const validatting = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const addStepDialog = ref(false)
const addRegionDialog = ref(false)
const addBoundaryDialog = ref(false)
const addSubregionDialog = ref(false)
const addInterfaceDialog = ref(false)
const addMeshingDialog = ref(false)
const addMessagesDialog = ref(false)
const deleteDialog = ref(false)
const activeNode = ref(undefined)
const entityToDelete = ref(null)
const step = reactive({
  file: null,
})
const region = reactive({
  name: '',
  stl: null,
})
const subregion = reactive({
  name: '',
  stl: null,
})
const boundary = reactive({
  name: '',
  stl: null,
})
const interface_ = reactive({
  r1: null,
  r2: null,
})
const meshing = reactive({
  resolution: '',
})
const activeRegion = ref([])
const activeInterface = ref([])
const showData = ref(false)
const showErrors = ref(false)
const hidden = ref([])
const messages = ref([])

const interfaceName = (id) => {
  const result = (caseSetup.value.regions || []).find(
    (item) => item.id === id
  )
  return result && result.name
}

const validate = computed(() => ajv.compile(schema.value))
const ajvErrors = computed(() => {
  const valid = validate.value
  return !valid && validate.value.errors
})
const tree = computed(() => {
  return (
    caseSetup.value
    && caseSetup.value.regions.map((region, regionIndex) => ({
      id: region.id,
      name: region.name,
      model: region,
      type: 'region',
      index: regionIndex,
      isVisible: hidden.value.includes(region.id),
      children: [
        ...(region.subregions || []).map((subregion, index) => ({
          id: subregion.id,
          name: subregion.name,
          model: subregion,
          type: 'subregion',
          index,
          region,
          regionIndex,
          isVisible: hidden.value.includes(subregion.id),
        })),
        ...(region.boundaries || []).map((boundary, index) => ({
          id: boundary.id,
          name: boundary.name,
          model: boundary,
          type: 'boundary',
          index,
          region,
          regionIndex,
          isVisible: hidden.value.includes(boundary.id),
        })),
      ],
    }))
  )
})
const interfaces = computed(() => {
  return (
    caseSetup.value
    && caseSetup.value.interfaces.map((item, index) => {
      const r1Name = interfaceName(item.r1)
      const r2Name = interfaceName(item.r2)
      return {
        ...item,
        index,
        type: 'interface',
        name: `${r1Name} — ${r2Name}`,
      }
    })
  )
})
const options = computed(() => {
  return {
    debug: config.debug,
    disableAll: caseEntity.value.status > 0 || canEdit.value,
    autoFoldObjects: true,
    accordionMode: 'normal',
  }
})
const visible = computed(() => {
  return files.value.reduce((result, file) => {
    if (hidden.value.includes(file.caseComponentId)) {
      return result
    }
    return result.concat(file.id)
  }, [])
})
const disabledValidate = computed(() => {
  return caseEntity.value.validationStatus === 2
})
const disabledSubmit = computed(() => {
  const schemaValid = ajvErrors.value && ajvErrors.value.length > 0
  const noRegions = caseSetup.value.regions && !caseSetup.value.regions.length
  const caseValidated = disabledValidate.value
  const caseStatusesToDisable = caseEntity.value.status === 1 || caseEntity.value.status === 2
  return schemaValid || noRegions || !caseValidated || caseStatusesToDisable
})
const errorMessages = computed(() => {
  return messages.value.filter((i) => i.severity === 'error')
})

const validateCase = async() => {
  try {
    validatting.value = true

    const jobId = await startCaseValidation(caseEntity.value.id)
    const { jobStatus, messages } = await waitForJobResult(jobId)

    await updateCaseEntity()
  } catch (error) {
    handleServerError(error)
  } finally {
    validatting.value = false
  }
}
const handleServerError = (error) => {
  const message
    = error
    && error.response
    && error.response.data
    && error.response.data.Message

  store.commit('snackbar/error', { message })
}
const submit = async() => {
  try {
    submitting.value = true

    await axios.post(`${config.caseURL}/cases/submit`, {
      caseId: caseEntity.value.id,
    })

    // await this.getOrganizationProfile()

    router.push({
      name: 'projects-projectId-caseId',
      params: { projectId: project.value.id, caseId: caseEntity.value.id },
    })
    store.commit('snackbar/success')
  } catch (error) {
    handleServerError(error)
  } finally {
    submitting.value = false
  }
}
const uploadCaseStepFile = async(caseId, file) => {
  // Get pre-signedURL
  const uploadUrl = `${config.fileserverURL}/cases/${caseId}/files`
  const response = await axios.post(uploadUrl, {
    fileName: file.name,
    fileSize: file.size,
  })

  // Upload file
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Authorization': '',
  }

  // Fetch because axios has issues with CORS because of sending unwanted headers.
  await fetch(response.data.preSignedUrl, {
    method: 'PUT',
    headers,
    body: file,
  })

  return response.data
}

const uploadCaseFile = async(caseId, caseComponentId, file) => {
  // Get pre-signedURL
  const uploadUrl = `${$config.fileserverURL}/cases/${caseId}/files`
  const response = await axios.post(uploadUrl, {
    fileName: file.name,
    fileSize: file.size,
    caseComponentId,
  })

  // Upload file
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Authorization': '',
  }

  // Fetch because axios has issues with CORS because of sending unwanted headers.
  await fetch(response.data.preSignedUrl, {
    method: 'PUT',
    headers,
    body: file,
  })

  return response.data
}
const initializeCaseWithStepFile = async(caseId, fileId, fileURL) => {
  const url = `${config.caseURL}/jobs/initialize`
  const response = await axios.post(url, { caseId, fileId, fileURL })

  if (response.status === 200 || response.status === 202) {
    return response.data.jobId
  }
}
const convertStepFile = async(caseId, fileId, fileURL) => {
  const url = `${config.caseURL}/jobs/convert`
  const response = await axios.post(url, { caseId, fileId, fileURL })

  if (response.status === 200 || response.status === 202) {
    return response.data.jobId
  }
}
const startCaseValidation = async(caseId) => {
  const url = `${config.caseURL}/jobs/validate`
  const response = await axios.post(url, { caseId })

  if (response.status === 200 || response.status === 202) {
    return response.data.jobId
  }
}
const waitForJobResult = async(jobId) => {
  while (true) {
    const url = `${config.caseURL}/jobs/${jobId}/long`
    const response = await axios.get(url)

    if (response.status === 200) {
      return response.data
    } else {
      // 202 Accepted is regular flow when waiting
      // long polling not correctly implemented, so back to short polling
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}
const updateCaseEntity = async() => {
  const url = `${config.caseURL}/cases/${caseEntity.value.id}`
  caseEntity.value = await axios.$get(url, { progress: false })
}
const createRegion = async(caseId, name) => {
  const url = `${config.caseURL}/regions`
  const response = await axios.post(url, { caseId, name })
  return response.data
}
const createSubregion = async(caseId, regionId, name) => {
  const url = `${config.caseURL}/subregions`
  const response = await axios.post(url, { caseId, regionId, name })
  return response.data
}
const createBoundary = async(caseId, regionId, name) => {
  const url = `${config.caseURL}/boundaries`
  const response = await axios.post(url, { caseId, regionId, name })
  return response.data
}
const createOptimization = async(caseId, caseComponentId) => {
  const url = `${config.caseURL}/optimizations`
  const response = await axios.post(url, { caseId, caseComponentId })
  return response.data
}
const createInterface = async(caseId, firstRegionId, secondRegionId) => {
  const url = `${config.caseURL}/interfaces`
  const response = await axios.post(url, {
    caseId,
    firstRegionId,
    secondRegionId,
  })
  return response.data
}
const fetchFile = async(caseId, fileId) => {
  const url = `${config.fileserverURL}/cases/${caseId}/files/${fileId}`
  const response = await axios.$get(url)
  return response
}
const addStep = async() => {
  try {
    loading.value = true

    const upload = await uploadCaseStepFile(
      caseEntity.value.id,
      step.file,
    )

    const jobId = await initializeCaseWithStepFile(
      caseEntity.value.id,
      upload.id,
      upload.fileUrl,
    )

    const { jobStatus, messages } = await waitForJobResult(jobId)

    addStepDialog.value = false

    messages.value = messages
    if (messages.value.length > 0) {
      addMessagesDialog.value = true
    }

    // TODO, do not reload page, but fetch data instead somehow in this mess :)
    if (jobStatus === 2) {
      router.go()
    }
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}
const deleteFile = (caseComponentId) => {
  const index = files.value.findIndex(
    (file) => file.caseComponentId === caseComponentId
  )
  if (index >= 0) {
    files.value.splice(index, 1)
  }
}
const deleteRegion = async(regionId) => {
  const url = `${config.caseURL}/regions/${regionId}`
  const response = await axios.delete(url)
  const index = caseSetup.value.regions.findIndex(
    (region) => region.id === regionId,
  )
  caseSetup.value.regions.splice(index, 1)
  return response
}
const deleteSubregion = async(regionId, subregionId) => {
  const url = `${config.caseURL}/subregions/${subregionId}`
  const response = await axios.delete(url)
  const region = caseSetup.value.regions.find(
    (region) => region.id === regionId,
  )
  const index = region.subregions.findIndex(
    (subregion) => subregion.id === subregionId,
  )
  region.subregions.splice(index, 1)
  return response
}
const deleteBoundary = async(regionId, boundaryId) => {
  const url = `${config.caseURL}/boundaries/${boundaryId}`
  const response = await axios.delete(url)
  const region = caseSetup.value.regions.find(
    (region) => region.id === regionId,
  )
  const index = region.boundaries.findIndex(
    (boundary) => boundary.id === boundaryId,
  )
  region.boundaries.splice(index, 1)
  return response
}
const deleteInterface = async(interfaceId) => {
  const url = `${config.caseURL}/interfaces/${interfaceId}`
  const response = await axios.delete(url)
  const index = caseSetup.value.interfaces.findIndex(
    (interface_) => interface_.id === interfaceId,
  )
  caseSetup.value.interfaces.splice(index, 1)
  return response
}
const deleteOptimization = async(optimizationId) => {
  const index = activeNode.value.model.optimizations.findIndex(
    (o) => o.id === optimizationId,
  )
  activeNode.value.model.optimizations.splice(index, 1)
  const url = `${config.caseURL}/optimizations/${optimizationId}`
  const response = await axios.delete(url)
  return response
}
const addRegion = async() => {
  try {
    loading.value = true

    let newRegion = await createRegion(
      caseEntity.value.id,
      region.name,
    )

    const upload = await uploadCaseFile(
      caseEntity.value.id,
      newRegion.id,
      region.stl,
    )

    const jobId = await convertStepFile(
      caseEntity.value.id,
      upload.id,
      upload.fileUrl,
    )

    const { jobStatus, messages } = await waitForJobResult(jobId)

    if (jobStatus === 2) {
      newRegion = await axios.$get(
        `${config.caseURL}/regions/${newRegion.id}`,
      )

      const file = await fetchFile(
        caseEntity.value.id,
        newRegion.fileMetadataId,
      )
      files.value.push(file)

      if (!caseSetup.value.regions) {
        caseSetup.value.regions = []
      }

      caseSetup.value.regions.push({
        id: newRegion.id,
        name: newRegion.name,
        stl: upload.fileUrl,
      })

      await updateCaseEntity()

      addRegionDialog.value = false
    } else if (jobStatus > 2) {
      messages.value = messages
      addMessagesDialog.value = true
      deleteFile(newRegion.id)
      await deleteRegion(newRegion.id)
    }
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}
const selectRegion = (regionId) => {
  return caseSetup.value.regions.find((region) => region.id === regionId)
}
const addSubregion = async() => {
  try {
    loading.value = true

    const regionId = activeNode.id

    let newSubregion = await createSubregion(
      caseEntity.value.id,
      regionId,
      subregion.name,
    )

    const upload = await uploadCaseFile(
      caseEntity.value.id,
      newSubregion.id,
      subregion.stl,
    )

    const jobId = await convertStepFile(
      caseEntity.value.id,
      upload.id,
      upload.fileUrl,
    )

    const { jobStatus, messages } = await waitForJobResult(jobId)

    if (jobStatus === 2) {
      newSubregion = await axios.$get(
        `${config.caseURL}/subregions/${newSubregion.id}`,
      )

      const file = await fetchFile(
        caseEntity.value.id,
        newSubregion.fileMetadataId,
      )
      files.value.push(file)

      if (caseEntity.value.type === 1) {
        const url = `${config.caseURL}/subregions/${subregion.id}`
        newSubregion.subregionType = 'general'

        const data = {
          name: newSubregion.name,
          subregionType: newSubregion.subregionType,
          data: JSON.stringify(newSubregion),
        }
        await axios.$put(url, data)
      }

      const region = selectRegion(regionId)

      if (!region.subregions) {
        // this.$set(region, 'subregions', [])
        region.subregions = []
      }

      region.subregions.push({
        id: newSubregion.id,
        name: newSubregion.name,
        subregionType: newSubregion.subregionType,
        stl: upload.fileUrl,
      })

      await updateCaseEntity()

      addSubregionDialog.value = false
    } else if (jobStatus > 2) {
      messages.value = messages
      addMessagesDialog.value = true
      deleteFile(newSubregion.id)
      await deleteSubregion(regionId, newSubregion.id)
    }
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}
const addBoundary = async() => {
  try {
    loading.value = true

    const regionId = activeNode.value.id

    let newBoundary = await createBoundary(
      caseEntity.value.id,
      regionId,
      boundary.name,
    )

    const upload = await uploadCaseFile(
      caseEntity.value.id,
      newBoundary.id,
      boundary.stl,
    )

    const jobId = await convertStepFile(
      caseEntity.value.id,
      upload.id,
      upload.fileUrl,
    )

    const { jobStatus, messages } = await waitForJobResult(jobId)

    if (jobStatus === 2) {
      newBoundary = await axios.$get(
        `${config.caseURL}/boundaries/${newBoundary.id}`,
      )

      const file = await fetchFile(
        caseEntity.value.id,
        newBoundary.fileMetadataId,
      )
      files.value.push(file)

      const region = selectRegion(regionId)

      if (!region.boundaries) {
        // this.$set(region, 'boundaries', [])
        region.boundaries = []
      }

      region.boundaries.push({
        id: newBoundary.id,
        name: newBoundary.name,
        stl: upload.fileUrl,
      })

      await updateCaseEntity()

      addBoundaryDialog.value = false
    } else if (jobStatus > 2) {
      messages.value = messages
      addMessagesDialog.value = true
      deleteFile(newBoundary.id)
      await deleteBoundary(regionId, newBoundary.id)
    }
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}
const addOptimization = async() => {
  try {
    const optimization = await createOptimization(
      caseEntity.value.id,
      activeNode.value.id,
    )

    if (!activeNode.value.model.optimizations) {
      activeNode.value.model.optimizations = []
      // this.$set(this.activeNode.model, 'optimizations', [])
    }

    activeNode.value.model.optimizations.push(optimization)
  } catch (error) {
    handleServerError(error)
  }
}
const confirmDeleteEntity = async(event) => {
  switch (event.type) {
    case 'region':
    case 'subregion':
    case 'boundary':
    case 'interface': {
      entityToDelete.value = { ...activeNode.value }
      deleteDialog.value = true
      break
    }
    case 'optimization': {
      await deleteOptimization(event.id)
      break
    }
    default:
      break
  }
}
const deleteEntity = async() => {
  try {
    const caseComponentId = entityToDelete.value.id
    deleting.value = true

    switch (entityToDelete.value.type) {
      case 'region': {
        entityToDelete.value.children.forEach((component) =>
          deleteFile(component.id),
        )
        deleteFile(caseComponentId)
        await deleteRegion(caseComponentId)
        break
      }
      case 'subregion': {
        const regionId = entityToDelete.value.region.id
        deleteFile(caseComponentId)
        await deleteSubregion(regionId, caseComponentId)
        break
      }
      case 'boundary': {
        const regionId = entityToDelete.value.region.id
        deleteFile(caseComponentId)
        await deleteBoundary(regionId, caseComponentId)
        break
      }
      case 'interface': {
        await deleteInterface(caseComponentId)
        break
      }
      default:
        break
    }

    activeNode.value = null
    deleteDialog.value = false
    // STLReader.value && STLReader.value.resize()
    // this.$refs.STLReader && this.$refs.STLReader.resize()
    // this.$nextTick(
    //   () => this.$refs.STLReader && this.$refs.STLReader.resize()
    // )
  } catch (error) {
    handleServerError(error)
  } finally {
    deleting.value = false
  }
}
const updateCaseData = () => {
  const url = `${config.caseURL}/cases/${caseEntity.value.id}`
  const data = {
    name: caseSetup.value.name,
    type: caseSetup.value.type,
    data: JSON.stringify({ settings: caseSetup.value.settings }),
  }
  return axios.$put(url, data)
}
const updateRegion = () => {
  const regionId = activeNode.value.id
  const url = `${config.caseURL}/regions/${regionId}`
  const region = caseSetup.value.regions.find(
    (region) => region.id === regionId,
  )

  if (region.regionType) {
    const data = {
      name: region.name,
      regionType: region.regionType,
      data: JSON.stringify(region),
    }
    return axios.$put(url, data)
  }
  return Promise.resolve()
}
const updateSubregion = () => {
  const subregionId = activeNode.value.id
  const url = `${config.caseURL}/subregions/${subregionId}`
  const region = caseSetup.value.regions.find(
    (region) => region.id === activeNode.value.region.id,
  )
  const subregion = region.subregions.find(
    (subregion) => subregion.id === subregionId,
  )
  if (subregion.subregionType) {
    const data = {
      name: subregion.name,
      subregionType: subregion.subregionType,
      data: JSON.stringify(subregion),
    }
    return axios.$put(url, data)
  }
  return Promise.resolve()
}
const updateBoundary = () => {
  const boundaryId = activeNode.value.id
  const url = `${config.caseURL}/boundaries/${boundaryId}`
  const region = caseSetup.value.regions.find(
    (region) => region.id === activeNode.value.region.id,
  )
  const boundary = region.boundaries.find(
    (boundary) => boundary.id === boundaryId,
  )
  if (boundary.boundaryType) {
    const data = {
      name: boundary.name,
      boundaryType: boundary.boundaryType,
      data: JSON.stringify(boundary),
    }
    return axios.$put(url, data)
  }
  return Promise.resolve()
}
const updateInterface = () => {
  const interfaceId = activeNode.value.id
  const url = `${config.caseURL}/interfaces/${interfaceId}`
  const interface_ = caseSetup.value.interfaces.find(
    (interface_) => interface_.id === interfaceId,
  )
  if (interface_.interface && interface_.interface.interfaceType) {
    const data = {
      firstRegionId: interface_.r1,
      secondRegionId: interface_.r2,
      interfaceType: interface_.interface.interfaceType,
      data: JSON.stringify(interface_),
    }
    return axios.$put(url, data)
  }
  return Promise.resolve()
}
const updateOptimization = (optimization) => {
  const url = `${config.caseURL}/optimizations/${optimization.id}`

  if (optimization.optimizationType) {
    const data = {
      optimizationType: optimization.optimizationType,
      data: JSON.stringify(optimization),
    }
    return axios.$put(url, data)
  }
  return Promise.resolve()
}
const updateActiveEntity = async(event) => {
  try {
    if (event.key.match(/\.optimizations\.[0-9]+/)) {
      await updateOptimization(event.model)
    } else if (event.key.match(/\.optimizations\.currentSubSchema/)) {
      await updateOptimization(event.parent)
    } else {
      switch (activeNode.value.type) {
        case 'region':
          await updateRegion()
          break

        case 'subregion':
          await updateSubregion()
          break

        case 'boundary':
          await updateBoundary()
          break

        case 'interface':
          await updateInterface()
          break

        default:
          break
      }
    }
  } catch (error) {
    handleServerError(error)
  }
}
const addInterface = async() => {
  try {
    loading.value = true

    const newInterface_ = await createInterface(
      caseEntity.value.id,
      interface_.r1,
      interface_.r2,
    )

    if (!caseSetup.value.interfaces) {
      caseSetup.value.interfaces = []
      // this.$set(this.caseSetup, 'interfaces', [])
    }

    caseSetup.interfaces.push({
      id: newInterface_.id,
      r1: interface_.r1,
      r2: interface_.r2,
    })

    addInterfaceDialog.value = false
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}
const addMeshing = async() => {
  caseSetup.value.settings = {
    ...caseSetup.value.settings,
    meshing: { ...meshing.value },
  }
  await updateCaseData()
  submit()
  addMeshingDialog.value = false
}
const updateActive = (selectedItem) => {
  if (selectedItem && selectedItem.type === 'interface') {
    activeRegion.value.splice(0, 1)
    // this.$delete(this.activeRegion, 0)
  } else if (selectedItem) {
    activeInterface.value.splice(0, 1)
    // this.$delete(this.activeInterface, 0)
  }
  const activeElement = activeInterface.value[0] || activeRegion.value[0]
  if (
    (!activeNode.value && activeElement)
    || (activeNode.value && !activeElement)
  ) {
    activeNode.value = activeElement
    // this.$nextTick(
    //   () => this.$refs.STLReader && this.$refs.STLReader.resize()
    // )
  } else {
    activeNode.value = activeElement
  }
}
const getErrors = (name, model) => {
  const errors = []
  if (!model.$dirty) return errors
  switch (name) {
    case 'region-name':
      !model.required && errors.push('Please enter region name')
      break
    case 'subregion-name':
      !model.required && errors.push('Please enter subregion name')
      break
    case 'boundary-name':
      !model.required && errors.push('Please enter boundary name')
      break
    case 'region-stl':
      !model.required && errors.push('Please select region')
      break
    case 'subregion-stl':
      !model.required && errors.push('Please select subregion')
      break
    case 'boundary-stl':
      !model.required && errors.push('Please select boundary')
      break
    case 'interface-r1':
      !model.required && errors.push('Please select first region')
      break
    case 'interface-r2':
      !model.required && errors.push('Please select second region')
      break
    default:
      break
  }
  return errors
}
const isValidNode = (node) => {
  if (ajvErrors.value) {
    switch (node.type) {
      case 'region': {
        return !ajvErrors.value.some((error) => {
          const dataPath = `.regions[${node.index}]`
          return (
            error.dataPath.startsWith(dataPath)
            && error.schemaPath.includes(
              `/regions/items/oneOf/${node.regionType === 'fluid' ? 0 : 1}/`
            )
            && !(error.keyword === 'oneOf' && error.dataPath === dataPath)
            && !error.dataPath.includes(`${dataPath}.subregions`)
            && !error.dataPath.includes(`${dataPath}.boundaries`)
          )
        })
      }
      case 'subregion': {
        return !ajvErrors.value.some((error) => {
          const dataPath = `.regions[${node.regionIndex}].subregions[${node.index}]`
          return (
            error.dataPath.startsWith(dataPath)
            && error.schemaPath.includes(
              `/regions/items/oneOf/${
                node.region.regionType === 'fluid' ? 0 : 1
              }/`
            )
            && !(error.keyword === 'oneOf' && error.dataPath === dataPath)
          )
        })
      }
      case 'boundary': {
        return !ajvErrors.value.some((error) => {
          const dataPath = `.regions[${node.regionIndex}].boundaries[${node.index}]`
          return (
            error.dataPath.startsWith(dataPath)
            && error.schemaPath.includes(
              `/regions/items/oneOf/${
                node.region.regionType === 'fluid' ? 0 : 1
              }/`
            )
            && !(error.keyword === 'oneOf' && error.dataPath === dataPath)
          )
        })
      }
      case 'interface':
        return !ajvErrors.value.some((error) =>
          error.dataPath.startsWith(`.interfaces[${node.index}]`),
        )
      default:
        return true
    }
  }
  return true
}
const screenCapture = (imgSrc) => {
  openScreenshotDialog({
    imgSrc,
    viewName: caseEntity.value.name,
    projectId: project.value.id,
    viewData: {
      background: '#f5f7fa',
    },
  })
}
const handleError = (error) => {
  const message = error && error.message

  store.commit('snackbar/error', {
    message,
  })
}
const toggleVisibility = (node) => {
  const nodes = [node.id]

  if (node.type === 'region') {
    const children = node.children.map((child) => child.id)
    nodes.push(...children)
  }

  const isHidden = hidden.value.includes(node.id)

  nodes.forEach((nodeId) => {
    const itemIndex = hidden.value.indexOf(nodeId)

    if (isHidden && itemIndex >= 0) {
      hidden.value.splice(itemIndex, 1)
    } else if (!isHidden && itemIndex === -1) {
      hidden.value.push(nodeId)
    }
  })
}
// const debouncedBlur = ($v) => {
//   if (this.timeout) clearTimeout(this.timeout)
//   this.timeout = setTimeout(() => $v.$touch(), 200)
// },
// ...mapActions('organization', {
//   getOrganizationProfile: (dispatch) => dispatch('getOrganizationProfile'),
// }),
// ...mapActions(['openScreenshotDialog']),
// export default {
// watchQuery: [],
// components: { JsonSchema, STLReader, ScreenshotDialog },
// async asyncData({ $axios, $config, $content, error, params }) {
//   try {
//     const [
//       project,
//       caseSetup,
//       caseEntity,
//       files,
//       rawSchema,
//     ] = await Promise.all([
//       $axios.$get(`${$config.projectURL}/projects/${params.projectId}`),
//       $axios.$get(`${$config.caseURL}/cases/setup/${params.caseId}`),
//       $axios.$get(`${$config.caseURL}/cases/${params.caseId}`),
//       $axios.$get(`${$config.fileserverURL}/cases/${params.caseId}/files`),
//       $content('info.schema').fetch(),
//     ])

//     const schema = await RefParser.dereference(rawSchema)

//     caseSetup.settings = caseSetup.settings || {}
//     caseSetup.regions = caseSetup.regions || {}
//     caseSetup.interfaces = caseSetup.interfaces || {}

//     return {
//       project: Object.freeze(project),
//       schema: Object.freeze(schema),
//       caseEntity: Object.freeze(caseEntity),
//       caseSetup,
//       files,
//     }
//   } catch (e) {
//     error(e)
//   }
// },
// computed: {
//   ...mapState({
//     canEdit: (state) => state.auth.user.role > 0,
//   }),
// },
// watch: {
//   addStepDialog() {
//     this.$refs.step && this.$refs.step.reset()
//     this.$nextTick(() => {
//       this.$v.step.$reset()
//     })
//   },
//   addRegionDialog() {
//     this.$refs.region && this.$refs.region.reset()
//     this.$nextTick(() => {
//       this.$v.region.$reset()
//     })
//   },
//   addSubregionDialog() {
//     this.$refs.subregion && this.$refs.subregion.reset()
//     this.$nextTick(() => {
//       this.$v.subregion.$reset()
//     })
//   },
//   addBoundaryDialog() {
//     this.$refs.boundary && this.$refs.boundary.reset()
//     this.$nextTick(() => {
//       this.$v.boundary.$reset()
//     })
//   },
//   addInterfaceDialog() {
//     this.$refs.interface_ && this.$refs.interface_.reset()
//     this.$nextTick(() => {
//       this.$v.interface_.$reset()
//     })
//   },
//   addMeshingDialog() {
//     this.$refs.meshing && this.$refs.meshing.reset()
//     this.$nextTick(() => {
//       this.$v.meshing.$reset()
//     })
//   },
// },
// validations() {
//   return {
//     step: {
//       file: {
//         required,
//       },
//     },
//     region: {
//       name: {
//         required,
//         minLength: minLength(2),
//         maxLength: maxLength(255),
//       },
//       stl: {
//         required,
//       },
//     },
//     subregion: {
//       name: {
//         required,
//         minLength: minLength(2),
//         maxLength: maxLength(255),
//       },
//       stl: {
//         required,
//       },
//     },
//     boundary: {
//       name: {
//         required,
//         minLength: minLength(2),
//         maxLength: maxLength(255),
//       },
//       stl: {
//         required,
//       },
//     },
//     interface_: {
//       r1: { required },
//       r2: { required },
//     },
//     meshing: {
//       resolution: { required },
//     },
//   }
// },
// onBeforeUnmount() {
//   this.waitForStepProcessingTimeout
//     && clearTimeout(this.waitForStepProcessingTimeout)
//   this.waitForValidationTimeout && clearTimeout(this.waitForValidationTimeout)
// },
// head() {
//   return {
//     title: this.caseEntity.name,
//   }
// },
</script>

<style scoped>
.v-treeview >>> .v-treeview-node__toggle {
  width: 20px;
  height: 20px;
  font-size: 16px;
}
.setup-container {
  position: relative;
}
.setup-main {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: 0;
}
.setup-column,
.region-column {
  flex: 1 0 auto;
  position: relative;
  height: 100vh;
}
.region-column .v-card {
  min-height: 50%;
}
.region-column .v-card:not(:first-of-type) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.region-column .v-card:not(:last-of-type) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.region-column .v-card >>> .v-card__text {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
</style>
