import { mapState, mapGetters, mapActions } from 'vuex'

import { Breakpoints } from '@/paraview/constants'
import {
  ANNOTATIONS,
  DEFAULT_VIEW_TYPE,
  VIEW_TYPES,
  VIEW_TYPES_LPS,
  VIEW_ORIENTATIONS,
} from '@/components/Paraview/core/VtkView/constants'

import PalettePicker from '@/components/Paraview/widgets/PalettePicker'
import ToolbarSheet from '@/components/Paraview/core/ToolbarSheet'
import { BACKGROUND } from '@/components/Paraview/core/VtkView/palette'

const ROTATION_STEP = 2

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'VtkView',
  components: {
    PalettePicker,
    ToolbarSheet,
  },
  props: {
    layoutIndex: {
      default: 0,
      type: Number,
    },
    layoutCount: {
      default: 1,
      type: Number,
    },
    viewType: {
      default: '',
      type: String,
    },
    backgroundColor: {
      default: '#f6f7fb',
      type: String,
    },
  },
  data() {
    return {
      internalViewId: -1,
      internalIsActive: false,
      palette: BACKGROUND,
      backgroundSheet: false,
      inAnimation: false,
      viewPointMenuVisible: false,
      viewOrientation: null,
    }
  },
  computed: {
    ...mapState('views', {
      view(state) {
        return this.$proxyManager.getProxyById(
          state.viewTypeToId[this.viewType]
        )
      },
      axisVisible(state) {
        return state.axisVisible
      },
      axisType(state) {
        return state.axisType
      },
      axisPreset(state) {
        return state.axisPreset
      },
      fullscreen(state) {
        return state.fullscreen
      },
    }),
    ...mapGetters(['cameraViewPoints']),
    type() {
      return this.viewType.split(':')[0]
    },
    name() {
      return this.viewType.split(':')[1]
    },
    orientationLabels() {
      return this.axisPreset === 'lps' ? ['L', 'P', 'S'] : ['X', 'Y', 'Z']
    },
    viewTypes() {
      return this.axisPreset === 'lps' ? VIEW_TYPES_LPS : VIEW_TYPES
    },
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md
    },
    singleViewButton() {
      return this.layoutCount > 1
    },
    flipViewButton() {
      return (
        this.layoutCount === 1 ||
        (this.layoutCount === 4 && this.layoutIndex % 2 === 1)
      )
    },
    quadViewButton() {
      return this.layoutCount === 2 && this.layoutIndex === 1
    },
    isActive() {
      return (
        this.internalIsActive ||
        this.view === this.$proxyManager.getActiveView()
      )
    },
  },
  watch: {
    view(view) {
      this.tryMountView(view)
    },
  },
  proxyManagerHooks: {
    onActiveViewChange(view) {
      this.internalIsActive = view === this.view
    },
    onActiveSourceChange(source) {
      if (
        source &&
        source.getProxyName() === 'TrivialProducer' &&
        this.view.bindRepresentationToManipulator
      ) {
        const representation = this.$proxyManager.getRepresentation(
          source,
          this.view
        )
        this.view.bindRepresentationToManipulator(representation)
        this.view.updateWidthHeightAnnotation()
      }
    },
    onProxyRegistrationChange() {
      // update views annotation
      const hasImageData = this.$proxyManager
        .getSources()
        .find((s) => s.getDataset().isA && s.getDataset().isA('vtkImageData'))
      const views = this.$proxyManager.getViews()

      for (let i = 0; i < views.length; i++) {
        const view = views[i]
        view.setCornerAnnotation('se', '')
        if (view.getProxyName().includes('2D') && hasImageData) {
          view.setCornerAnnotations(ANNOTATIONS, true)
        } else {
          view.setCornerAnnotation('nw', '')
        }
      }
    },
  },
  mounted() {
    if (this.view) {
      this.tryMountView(this.view)
    }
    window.addEventListener('resize', this.resizeCurrentView)
    window.addEventListener('keyup', this.handleEsc)

    // Initial setup
    this.resizeCurrentView()
  },
  beforeDestroy() {
    if (this.view) {
      this.unmountView(this.view)
    }
    window.removeEventListener('resize', this.resizeCurrentView)
    window.removeEventListener('keyup', this.handleEsc)
  },
  beforeUpdate() {
    if (!this.view) {
      this.changeViewType(DEFAULT_VIEW_TYPE)
    }
  },
  methods: {
    tryMountView(view) {
      if (this.internalViewId > -1) {
        const oldView = this.$proxyManager.getProxyById(this.internalViewId)
        this.unmountView(oldView)
        this.internalViewId = -1
      }

      if (view) {
        this.internalViewId = view.getProxyId()
        view.setContainer(this.$el.querySelector('.js-view'))
        const widgetManager = view.getReferenceByName('widgetManager')
        if (widgetManager) {
          widgetManager.setUseSvgLayer(true)
          // workaround to disable picking if previously disabled
          if (!widgetManager.getPickingEnabled()) {
            widgetManager.disablePicking()
          }
        }
      }
    },
    unmountView(view) {
      const widgetManager = view.getReferenceByName('widgetManager')
      if (widgetManager) {
        // we can't use svg anyways if there is no container
        widgetManager.setUseSvgLayer(false)
      }
      view.setContainer(null)
    },
    changeViewType(viewType) {
      this.swapViews({
        index: this.layoutIndex,
        viewType,
      })
    },
    getAvailableActions() {
      return {
        single: this.layoutCount > 1,
        split: this.layoutCount < 4,
      }
    },
    resetCamera() {
      if (this.view) {
        this.view.resetCamera()
      }
    },
    rollLeft() {
      if (this.view) {
        this.view.setAnimation(true, this)
        let count = 0
        let intervalId = null
        const rotate = () => {
          if (count < 90) {
            count += ROTATION_STEP
            this.view.rotate(+ROTATION_STEP)
          } else {
            clearInterval(intervalId)
            this.view.setAnimation(false, this)
          }
        }
        intervalId = setInterval(rotate, 1)
      }
    },
    rollRight() {
      if (this.view) {
        this.view.setAnimation(true, this)
        let count = 0
        let intervalId = null
        const rotate = () => {
          if (count < 90) {
            count += ROTATION_STEP
            this.view.rotate(-ROTATION_STEP)
          } else {
            clearInterval(intervalId)
            this.view.setAnimation(false, this)
          }
        }
        intervalId = setInterval(rotate, 1)
      }
    },
    updateOrientation(mode) {
      if (this.view && !this.inAnimation) {
        this.inAnimation = true
        const { axis, viewUp } = VIEW_ORIENTATIONS[mode]
        let { orientation } = VIEW_ORIENTATIONS[mode]
        let animateSteps = 100

        if (this.viewOrientation && this.viewOrientation.axis === axis) {
          animateSteps = 0

          if (this.viewOrientation.orientation === orientation) {
            orientation *= -1
          }
        }

        this.viewOrientation = { axis, orientation, viewUp }

        this.view
          .updateOrientation(axis, orientation, viewUp, animateSteps)
          .then(() => {
            this.inAnimation = false
            this.view.renderLater()
          })
      }
    },
    resizeCurrentView() {
      if (this.view) {
        this.view.resize()
      }
    },
    screenCapture() {
      this.takeScreenshot(this.view)
    },
    toggleFullscreen() {
      this.toggleFullscreen()
      this.$nextTick(() => this.resizeCurrentView())
    },
    changeBackgroundColor(color) {
      this.changeBackground({
        viewType: this.viewType,
        color,
      })
    },
    handleEsc(event) {
      if (event.which === 27 && this.fullscreen) {
        this.toggleFullscreen()
      }
    },
    ...mapActions('views', [
      'changeBackground',
      'swapViews',
      'singleView',
      'splitView',
      'quadView',
      'toggleFullscreen',
    ]),
    ...mapActions(['takeScreenshot', 'changeCameraViewPoint']),
  },
}
