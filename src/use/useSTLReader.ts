import { newInstance as vtkGenericRenderWindow } from 'vtk.js/Sources/Rendering/Misc/GenericRenderWindow'
import Constants, {
  newInstance as vtkOrientationMarkerWidget,
} from 'vtk.js/Sources/Interaction/Widgets/OrientationMarkerWidget'
import { newInstance as vtkAxesActor } from 'vtk.js/Sources/Rendering/Core/AxesActor'
import { newInstance as vtkInteractorStyleManipulator } from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator'
import InteractionPresets from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator/Presets'
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder'
import {
  INTERACTOR_STYLE_DEFINITIOS as interactorStyleDefinitions,
  ROTATION_STEP,
  EPSILON,
} from '~/constants'

export default () => {
  const name = 'STLReader'

  const actors = reactive({})
  const genericRenderWindow = ref({})
  const renderer = ref({})
  const camera = ref({})
  const renderWindow = ref({})
  const interactor = ref({})
  const interactorStyle = ref({})
  const axes = ref({})
  const orientationWidget = ref({})
  const container = ref(null)
  const inAnimation = ref<boolean>(false)
  const viewOrientation = ref(null)

  const initView = () => {
    genericRenderWindow.value = vtkGenericRenderWindow({
      background: [0, 0, 0, 0],
    })
    genericRenderWindow.value.setContainer(container.value)
    genericRenderWindow.value.resize()

    renderer.value = genericRenderWindow.value.getRenderer()
    camera.value = renderer.value.getActiveCamera()
    renderWindow.value = genericRenderWindow.value.getRenderWindow()
    interactor.value = genericRenderWindow.value.getInteractor()
    interactorStyle.value = vtkInteractorStyleManipulator()

    interactor.value.setInteractorStyle(interactorStyle.value)
    InteractionPresets.applyDefinitions(
      interactorStyleDefinitions,
      interactorStyle.value,
    )

    axes.value = vtkAxesActor()

    orientationWidget.value = vtkOrientationMarkerWidget({
      actor: axes.value,
      interactor: interactor.value,
    })

    orientationWidget.value.setEnabled(true)
    orientationWidget.value.setViewportCorner(Constants.Corners.BOTTOM_LEFT)
    orientationWidget.value.setViewportSize(0.15)
    orientationWidget.value.setMinPixelSize(100)
    orientationWidget.value.setMaxPixelSize(300)
  }

  const deleteActor = (actor) => {
    Object.keys(actor).forEach((key) => actor[key].delete())
  }

  const destroyView = () => {
    genericRenderWindow.value.setContainer(null)
    genericRenderWindow.value.delete()
    orientationWidget.value.delete()
    axes.value.delete()
    renderer.value.delete()
    camera.value.delete()
    renderWindow.value.delete()
    interactor.value.delete()
    interactorStyle.value.delete()

    Object.keys(actors).forEach((actorId) => {
      deleteActor(actors[actorId])
    })
  }

  const render = (blocking = true) => {
    renderer.value.resetCameraClippingRange()
    orientationWidget.value.updateMarkerOrientation()

    if (blocking) {
      renderWindow.value.render()
    } else {
      setTimeout(renderWindow.value.render, 0)
    }
  }

  const renderLater = () => {
    render(false)
  }

  const setAnimation = (enable: boolean, requester: string) => {
    if (enable) {
      interactor.value.requestAnimation(requester)
    } else {
      interactor.value.cancelAnimation(requester, true)
    }
  }

  const resetCamera = () => {
    const camera = renderer.value.getActiveCamera()
    renderer.value.resetCamera()
    renderer.value.resetCameraClippingRange()
    interactorStyle.value.setCenterOfRotation(camera.getFocalPoint())
    renderLater()
  }

  const rotate = (angle: number) => {
    const { viewUp, focalPoint, position } = camera.value.get(
      'viewUp',
      'focalPoint',
      'position',
    )
    const axis = [
      focalPoint[0] - position[0],
      focalPoint[1] - position[1],
      focalPoint[2] - position[2],
    ]

    vtkMatrixBuilder
      .buildFromDegree()
      .rotate(Number.isNaN(angle) ? 90 : angle, axis)
      .apply(viewUp)

    camera.value.setViewUp(...viewUp)
    camera.value.modified()
    orientationWidget.value.updateMarkerOrientation()
    renderWindow.value.render()
  }

  const rollLeft = () => {
    setAnimation(true, name)
    let count = 0
    let intervalId = null
    const rotateInterval = () => {
      if (count < 90) {
        count += ROTATION_STEP
        rotate(+ROTATION_STEP)
      } else {
        clearInterval(intervalId)
        setAnimation(false, name)
      }
    }
    intervalId = setInterval(rotateInterval, 1)
  }

  const rollRight = () => {
    setAnimation(true, name)
    let count = 0
    let intervalId = null
    const rotateInterval = () => {
      if (count < 90) {
        count += ROTATION_STEP
        rotate(-ROTATION_STEP)
      } else {
        clearInterval(intervalId)
        setAnimation(false, name)
      }
    }
    intervalId = setInterval(rotateInterval, 1)
  }

  const moveCamera = (focalPoint, position, viewUp, animateSteps = 0) => {
    const originalFocalPoint = camera.value.getFocalPoint()
    const originalPosition = camera.value.getPosition()
    const originalViewUp = camera.value.getViewUp()

    const animationStack = [{
      focalPoint,
      position,
      viewUp,
    }]

    if (animateSteps) {
      const deltaFocalPoint = [
        (originalFocalPoint[0] - focalPoint[0]) / animateSteps,
        (originalFocalPoint[1] - focalPoint[1]) / animateSteps,
        (originalFocalPoint[2] - focalPoint[2]) / animateSteps,
      ]
      const deltaPosition = [
        (originalPosition[0] - position[0]) / animateSteps,
        (originalPosition[1] - position[1]) / animateSteps,
        (originalPosition[2] - position[2]) / animateSteps,
      ]
      const deltaViewUp = [
        (originalViewUp[0] - viewUp[0]) / animateSteps,
        (originalViewUp[1] - viewUp[1]) / animateSteps,
        (originalViewUp[2] - viewUp[2]) / animateSteps,
      ]

      const needSteps
        = deltaFocalPoint[0]
        || deltaFocalPoint[1]
        || deltaFocalPoint[2]
        || deltaPosition[0]
        || deltaPosition[1]
        || deltaPosition[2]
        || deltaViewUp[0]
        || deltaViewUp[1]
        || deltaViewUp[2]

      const focalPointDeltaAxisCount = deltaFocalPoint
        .map((i) => (Math.abs(i) < EPSILON ? 0 : 1))
        .reduce((a, b) => a + b, 0)
      const positionDeltaAxisCount = deltaPosition
        .map((i) => (Math.abs(i) < EPSILON ? 0 : 1))
        .reduce((a, b) => a + b, 0)
      const viewUpDeltaAxisCount = deltaViewUp
        .map((i) => (Math.abs(i) < EPSILON ? 0 : 1))
        .reduce((a, b) => a + b, 0)
      const rotation180Only
        = viewUpDeltaAxisCount === 1
        && positionDeltaAxisCount === 0
        && focalPointDeltaAxisCount === 0

      if (needSteps) {
        if (rotation180Only) {
          const availableAxes = originalFocalPoint
            .map((fp, i) =>
              Math.abs(originalPosition[i] - fp) < EPSILON ? i : null,
            )
            .filter((i) => i !== null)
          const axisCorrectionIndex = availableAxes.find(
            (v) => Math.abs(deltaViewUp[v]) < EPSILON,
          )
          for (let i = 0; i < animateSteps; i++) {
            const newViewUp = [
              viewUp[0] + (i + 1) * deltaViewUp[0],
              viewUp[1] + (i + 1) * deltaViewUp[1],
              viewUp[2] + (i + 1) * deltaViewUp[2],
            ]
            newViewUp[axisCorrectionIndex] = Math.sin(
              (Math.PI * i) / (animateSteps - 1),
            )
            animationStack.push({
              focalPoint,
              position,
              viewUp: newViewUp,
            })
          }
        } else {
          for (let i = 0; i < animateSteps; i++) {
            animationStack.push({
              focalPoint: [
                focalPoint[0] + (i + 1) * deltaFocalPoint[0],
                focalPoint[1] + (i + 1) * deltaFocalPoint[1],
                focalPoint[2] + (i + 1) * deltaFocalPoint[2],
              ],
              position: [
                position[0] + (i + 1) * deltaPosition[0],
                position[1] + (i + 1) * deltaPosition[1],
                position[2] + (i + 1) * deltaPosition[2],
              ],
              viewUp: [
                viewUp[0] + (i + 1) * deltaViewUp[0],
                viewUp[1] + (i + 1) * deltaViewUp[1],
                viewUp[2] + (i + 1) * deltaViewUp[2],
              ],
            })
          }
        }
      }
    }

    if (animationStack.length === 1) {
      // update camera directly
      camera.value.set(animationStack.pop())
      renderer.value.resetCameraClippingRange()
      if (interactor.value.getLightFollowCamera()) {
        renderer.value.updateLightsGeometryToFollowCamera()
      }
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const animationRequester = performance.now().toString()
      setAnimation(true, animationRequester)
      let intervalId = null
      const consumeAnimationStack = () => {
        if (animationStack.length) {
          const {
            focalPoint: cameraFocalPoint,
            position: cameraPosition,
            viewUp: cameraViewUp,
          } = animationStack.pop()
          camera.value.setFocalPoint(...cameraFocalPoint)
          camera.value.setPosition(...cameraPosition)
          camera.value.setViewUp(...cameraViewUp)
          renderer.value.resetCameraClippingRange()

          if (interactor.value.getLightFollowCamera()) {
            renderer.value.updateLightsGeometryToFollowCamera()
          }
        } else {
          clearInterval(intervalId)
          setAnimation(false, animationRequester)
          resolve()
        }
      }
      intervalId = setInterval(consumeAnimationStack, 1)
    })
  }

  const updateOrientation = (mode, animateSteps = 0) => {
    if (!inAnimation.value) {
      inAnimation.value = true
      const { axis, orientation, viewUp } = mode
      const originalPosition = camera.value.getPosition()
      const originalViewUp = camera.value.getViewUp()
      const originalFocalPoint = camera.value.getFocalPoint()
      const position = camera.value.getFocalPoint()

      const viewOrientationTemp = { axis, orientation, viewUp }

      if (viewOrientation.value && viewOrientation.value.axis === axis) {
        animateSteps = 0

        if (viewOrientation.value.orientation === orientation) {
          viewOrientationTemp.orientation *= -1
        }
      }

      position[axis] += viewOrientationTemp.orientation

      viewOrientation.value = viewOrientationTemp
      camera.value.setPosition(...position)
      camera.value.setViewUp(...viewUp)
      renderer.value.resetCamera()

      const destFocalPoint = camera.value.getFocalPoint()
      const destPosition = camera.value.getPosition()
      const destViewUp = camera.value.getViewUp()

      // Reset to original to prevent initial render flash
      camera.value.setFocalPoint(...originalFocalPoint)
      camera.value.setPosition(...originalPosition)
      camera.value.setViewUp(...originalViewUp)

      moveCamera(
        destFocalPoint,
        destPosition,
        destViewUp,
        animateSteps,
      ).then(() => {
        inAnimation.value = false
        renderLater()
      })
    }
  }

  return {
    actors,
    genericRenderWindow,
    renderer,
    camera,
    renderWindow,
    interactor,
    interactorStyle,
    axes,
    orientationWidget,
    container,
    initView,
    destroyView,
    deleteActor,
    renderLater,
    setAnimation,
    resetCamera,
    rotate,
    rollLeft,
    rollRight,
    updateOrientation,
  }
}
