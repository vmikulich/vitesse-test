<template>
  <div class="stl-reader">
    <div
      ref="container"
      class="stl-container"
      :class="{ 'stl-fullscreen': fullscreen }"
    ></div>
    <div v-if="loading" class="d-flex stl-loading">
      <v-progress-circular
        class="mx-auto my-auto"
        indeterminate
        color="primary"
        :size="70"
        :width="7"
      ></v-progress-circular>
    </div>
    <v-card
      class="stl-toolbar"
      :class="{ 'stl-toolbar-fullscreen': fullscreen }"
    >
      <v-card-text class="py-2 px-2">
        <v-tooltip top>
          <span>Reset camera</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="resetCamera()">
              <v-icon>mdi-image-filter-center-focus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Rotate camera left 90°</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="rollLeft()">
              <v-icon>mdi-rotate-left</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Rotate camera right 90°</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="rollRight()">
              <v-icon>mdi-rotate-right</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Reset Camera to Orientation {{ orientationLabels[0] }}</span>
          <template #activator="{ on }">
            <v-btn
              color="#ff0000"
              icon
              v-on="on"
              @click="updateOrientation(viewOrientations.x, 100)"
            >
              {{ orientationLabels[0] }}
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Reset Camera to Orientation {{ orientationLabels[1] }}</span>
          <template #activator="{ on }">
            <v-btn
              color="#fed000"
              icon
              v-on="on"
              @click="updateOrientation(viewOrientations.y, 100)"
            >
              {{ orientationLabels[1] }}
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Reset Camera to Orientation {{ orientationLabels[2] }}</span>
          <template #activator="{ on }">
            <v-btn
              color="#008000"
              icon
              v-on="on"
              @click="updateOrientation(viewOrientations.z, 100)"
            >
              {{ orientationLabels[2] }}
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>{{ mousepan ? 'Rotate' : 'Pan' }}</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="togglePan">
              <v-icon>
                {{ mousepan ? 'mdi-rotate-3d-variant' : 'mdi-hand-right' }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Toggle Fullscreen</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="toggleFullscreen">
              <v-icon>
                {{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip top>
          <span>Take Screenshot</span>
          <template #activator="{ on }">
            <v-btn color="primary" icon v-on="on" @click="screenCapture()">
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { newInstance as vtkActor } from 'vtk.js/Sources/Rendering/Core/Actor'
import { newInstance as vtkMapper } from 'vtk.js/Sources/Rendering/Core/Mapper'
import { newInstance as vtkSTLReader } from 'vtk.js/Sources/IO/Geometry/STLReader'
import InteractionPresets from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator/Presets'
import {
  VIEW_ORIENTATIONS,
  ORIENTATION_LABELS as orientationLabels,
  INTERACTOR_STYLE_DEFINITIOS as interactorStyleDefinitions,
} from '~/constants'
import useSTLReader from '~/use/useSTLReader'

const emit = defineEmits(['error', 'screenshot'])

const props = defineProps({
  files: {
    type: Array,
    required: true,
  },
  visible: {
    type: Array,
    required: true,
  },
})

const {
  actors,
  genericRenderWindow,
  renderer,
  renderWindow,
  interactorStyle,
  orientationWidget,
  container,
  initView,
  destroyView,
  deleteActor,
  renderLater,
  resetCamera,
  rollLeft,
  rollRight,
  updateOrientation,
} = useSTLReader()

const fullscreen = ref<boolean>(false)
const mousepan = ref<boolean>(false)
const viewOrientations = ref(VIEW_ORIENTATIONS)
const loading = ref<boolean>(false)
const resetCameraOnFirstRender = ref<boolean>(true)

watch(props.files, () => {
  update()
})
watch(props.visible, () => {
  Object.keys(actors).forEach((actorId) => {
    const isVisible = props.visible.includes(Number(actorId))
    actors[actorId].actor.setVisibility(isVisible)
    renderWindow.render()
  })
})
watch(fullscreen, () => {
  if (fullscreen.value === false) {
    window.removeEventListener('keyup', handleEsc)
  } else {
    window.addEventListener('keyup', handleEsc)
  }
})

onMounted(() => {
  initView()
  update()
  console.log(actors)
  console.log(renderer)
  console.log(renderWindow)
  console.log(interactorStyle)
  console.log(orientationWidget)
})

onBeforeUnmount(() => {
  destroyView()
  window.removeEventListener('keyup', handleEsc)
})

async function update() {
  const newActors = []
  const actorsIds = Object.keys(actors)
  if (actorsIds.length > props.files.length) {
    actorsIds.forEach((actorId) => {
      const actor = actors[actorId]
      if (!props.files.some((file) => file.id === actorId)) {
        delete actors[actorId]
        deleteActor(actor)
        renderer.value.removeActor(actor.actor)
      }
    })
  }
  props.files.forEach((file) => {
    if (file && file.link && !actors[file.id]) {
      const reader = vtkSTLReader()
      const mapper = vtkMapper({ scalarVisibility: false })
      const actor = vtkActor()
      const isVisible = props.visible.includes(file.id)
      actor.setMapper(mapper)
      mapper.setInputConnection(reader.getOutputPort())
      actor.setVisibility(isVisible)

      actors[file.id] = { reader, mapper, actor }

      newActors.push(
        reader
          .setUrl(file.link, { binary: true })
          .then((result) => (result ? actor : null)),
      )
    }
  })
  try {
    loading.value = true
    await Promise.all(newActors).then((results) => {
      results.forEach((actor) => actor && renderer.value.addActor(actor))
      if (resetCameraOnFirstRender.value) {
        resetCameraOnFirstRender.value = false
        resetCamera()
      }
      renderWindow.value.render()
      renderLater()
    })
  } catch (error) {
    emit('error', error)
  } finally {
    loading.value = false
  }
}

const screenCapture = async() => {
  const screenshot = await renderWindow.value.captureImages()[0]
  emit('screenshot', screenshot)
}

const resize = () => {
  genericRenderWindow.value.resize()
  orientationWidget.value.updateViewport()
  resetCamera()
}

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
  resize()
}

const togglePan = () => {
  mousepan.value = !mousepan.value
  interactorStyle.value.removeAllMouseManipulators()

  interactorStyleDefinitions[0].options.button = mousepan.value ? 3 : 1
  interactorStyleDefinitions[1].options.button = mousepan.value ? 1 : 3

  InteractionPresets.applyDefinitions(
    interactorStyleDefinitions,
    interactorStyle,
  )
}

const handleEsc = (event) => {
  if (event.which === 27) {
    toggleFullscreen()
  }
}

</script>
<style scoped>
.stl-reader {
  position: relative;
  height: 100%;
  width: 100%;
}
.stl-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(245, 247, 250, 0.75);
  z-index: 1;
}
.stl-toolbar {
  position: absolute;
  bottom: 0;
  right: 0;
  user-select: none;
}
.stl-container {
  margin: 0;
  padding: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
}
.stl-fullscreen {
  position: fixed;
  z-index: 1000;
}
.stl-toolbar-fullscreen {
  position: fixed;
  z-index: 1001;
  bottom: 24px;
  right: 24px;
}
</style>
