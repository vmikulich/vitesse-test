import superWidgetBehavior from 'vtk.js/Sources/Widgets/Widgets3D/DistanceWidget/behavior'

import widgetManipulatorWatcher from '~/paraview/vtk/widgetManipulatorWatcher'

export default function widgetBehavior(publicAPI, model) {
  superWidgetBehavior(publicAPI, model)
  widgetManipulatorWatcher(publicAPI, model)
}
