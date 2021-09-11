<template>
  <v-container fluid fill-height>
    <v-flex shrink class="mb-3">
      <v-row class="px-4 py-4">
        <v-col sm="12" md="6">
          <h1 class="font-weight-medium">
            Projects
          </h1>
        </v-col>
        <v-col sm="12" md="6" class="d-flex">
          <v-select
            v-model="statuses"
            :items="statusOptions"
            item-text="name"
            item-value="status"
            placeholder="All statuses"
            multiple
            chips
            deletable-chips
            dense
            solo
            flat
            hide-details
            class="ml-auto status-select v-text-field--transparent"
            @change="filterStatus"
          ></v-select>

          <v-dialog v-model="addProjectDialog" max-width="420px" scrollable>
            <template #activator="{ on, attrs }">
              <v-btn
                v-if="canEdit"
                type="button"
                color="primary"
                dark
                class="pl-3 ml-2"
                elevation="0"
                large
                v-bind="attrs"
                v-on="on"
              >
                <v-icon small class="mr-1">
                  mdi-plus
                </v-icon>
                Add Project
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline font-weight-medium">Add Project</span>
                <v-btn
                  type="button"
                  class="ml-auto mt-n4"
                  icon
                  @click="addProjectDialogHandler(false)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text class="pb-0">
                <v-form
                  ref="form"
                  class="mt-2"
                  lazy-validation
                  @submit.prevent="submit"
                >
                  <v-text-field
                    v-model.trim="project.name"
                    label="Project name *"
                    name="project-name"
                    autocomplete="off"
                    required
                    outlined
                    :maxlength="255"
                    :error-messages="getErrors('name')"
                    @blur="v$.name.$touch()"
                  ></v-text-field>
                  <v-textarea
                    v-model.trim="project.description"
                    auto-grow
                    label="Description *"
                    rows="6"
                    outlined
                    :maxlength="255"
                    :error-messages="getErrors('name')"
                    @blur="v$.description.$touch()"
                  ></v-textarea>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  type="button"
                  color="primary"
                  block
                  large
                  elevation="0"
                  :loading="loading"
                  @click="submit"
                >
                  Add Project
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-flex>
    <div v-if="projects.length">
      <v-flex grow class="px-4">
        <v-row class="mb-2">
          <v-col
            v-for="card in openProjects"
            :key="card.id"
            cols="12"
            sm="6"
            lg="3"
          >
            <ProjectCard :card="card" @toggle="toggleProjectStatus" />
          </v-col>
        </v-row>
      </v-flex>
      <v-flex v-if="archivedProjects.length" grow class="px-4">
        <h2 class="text--secondary font-weight-medium mb-5">
          Archived projects
        </h2>
        <v-row class="mb-2">
          <v-col
            v-for="card in archivedProjects"
            :key="card.id"
            cols="12"
            sm="6"
            lg="3"
          >
            <ProjectCard :card="card" @toggle="toggleProjectStatus" />
          </v-col>
        </v-row>
      </v-flex>
    </div>
    <template v-else>
      <v-flex grow d-flex>
        <div class="mx-auto my-auto">
          <v-img
            src="./src/assets/content-placeholder.svg"
            width="132"
            height="132"
            class="mb-4 mt-n4 mx-auto"
          ></v-img>
          <p class="headline font-weight-medium">
            {{ statuses.length ? 'No projects found' : '+ Add project' }}
          </p>
        </div>
      </v-flex>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import useUser from '~/use/useUser'
import useProject from '~/use/useProject'
import useOrganization from '~/use/useOrganization'
import { IProject } from '~/interfaces/projects'
import { PROJECT_STATUSES_NAMES as projectStatuses } from '~/constants/index'

const router = useRouter()
const store = useStore()

const { canEdit } = useUser()
const { organizationId } = useOrganization()
const {
  projects,
  fetchAllProjects,
  changeProjectStatus,
  createProject,
} = useProject()

const statuses = ref<number[]>([])
const addProjectDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const project = reactive<{ name: string; description: string }>({
  name: '',
  description: '',
})
const projectValidators = {
  name: {
    required,
    maxLength: maxLength(255),
  },
  description: {
    required,
    maxLength: maxLength(255),
  },
}
const v$ = useVuelidate(projectValidators, project)

const statusOptions: { status: number; name: string }[] = [
  { status: 0, name: 'Ongoing' },
  { status: 1, name: 'Problem' },
  { status: 2, name: 'Finished' },
  { status: 3, name: 'Closed' },
]

const archivedProjects = computed(() => {
  return projects.value.filter((project: IProject) => projectStatuses[project.status] === 'closed')
})

const openProjects = computed(() => {
  return projects.value.filter((project: IProject) => projectStatuses[project.status] !== 'closed')
})

onMounted(async() => {
  const query = router.currentRoute.value.query
  const params = new URLSearchParams()

  if (query.status) {
    if (Array.isArray(query.status)) {
      statuses.value.push(...query.status.map(Number))
    }
    else {
      statuses.value.push(+query.status)
    }
    statuses.value.forEach((status: number) => params.append('status', status.toString()))
  }

  params.append('SortField.Order', 'asc')
  params.append('SortField.Name', 'name')

  const data: { id: number; params: URLSearchParams } = {
    id: organizationId.value,
    params,
  }
  await fetchAllProjects(data)
})

const addProjectDialogHandler = (status: boolean) => {
  addProjectDialog.value = !addProjectDialog.value
}

const handleServerError = (error) => {
  const message = error.Message
  store.commit('snackbar/error', {
    message,
  })
}

const toggleProjectStatus = async(projectId: number, isProjectClosed: boolean) => {
  try {
    const data = {
      id: projectId,
      params: {
        isProjectClosed,
      },
    }
    await changeProjectStatus(data)
  } catch (error) {
    handleServerError(error)
  }
}

const filterStatus = (status: string) => {
  router.replace({ name: 'projects', query: { status } })
}

const getErrors = (name: string) => {
  const errors: Array<string> = []
  const model = v$.value[name]
  if (!model.$dirty) return errors
  switch (name) {
    case 'name':
      !model.required && errors.push('Please enter project name')
      break
    case 'description':
      !model.required && errors.push('Please enter project description')
      break
    default:
      break
  }
  return errors
}

const submit = async() => {
  try {
    loading.value = true
    const data = {
      ...project,
      organizationId: organizationId.value,
    }
    const { projectId } = await createProject(data)
    addProjectDialog.value = false
    store.commit('snackbar/success')
    router.push({
      name: 'projects-projectId',
      params: {
        projectId,
      },
    })
  } catch (error) {
    handleServerError(error)
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss">
.status-select {
  &.v-input--dense {
    overflow: hidden;
    min-width: 162px;
    flex-grow: 0;

    .v-select__selections {
      flex-wrap: nowrap;
      overflow: hidden;
      justify-content: flex-start;

      .v-chip {
        flex: none;
        max-width: none;
      }

      input {
        position: absolute;
      }
    }
  }
}
</style>
