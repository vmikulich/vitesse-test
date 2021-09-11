import vtk2DView from 'vtk.js/Sources/Proxy/Core/View2DProxy'
import vtkGeometryRepresentationProxy from 'vtk.js/Sources/Proxy/Representations/GeometryRepresentationProxy'
import vtkSkyboxRepresentationProxy from 'vtk.js/Sources/Proxy/Representations/SkyboxRepresentationProxy'
import vtkGlyphRepresentationProxy from 'vtk.js/Sources/Proxy/Representations/GlyphRepresentationProxy'
import vtkLookupTableProxy from 'vtk.js/Sources/Proxy/Core/LookupTableProxy'
import vtkMoleculeRepresentationProxy from 'vtk.js/Sources/Proxy/Representations/MoleculeRepresentationProxy'
import vtkPiecewiseFunctionProxy from 'vtk.js/Sources/Proxy/Core/PiecewiseFunctionProxy'
import vtkProxySource from 'vtk.js/Sources/Proxy/Core/SourceProxy'
import vtkView from 'vtk.js/Sources/Proxy/Core/ViewProxy'

import vtkPaintWidget from 'vtk.js/Sources/Widgets/Widgets3D/PaintWidget'

import vtkWidgetProxy from '~/paraview/vtk/WidgetProxy'

import ConfigUtils from '~/paraview/config/configUtils'

import proxyUI from '~/paraview/config/proxyUI'
import proxyLinks from '~/paraview/config/proxyLinks'
import proxyViewRepresentationMapping from '~/paraview/config/proxyViewRepresentationMapping'

const { createProxyDefinition, activateOnCreate } = ConfigUtils

const ViewToWidgetTypes = {
  View3D: 'VOLUME',
  View2D_X: 'SLICE',
  View2D_Y: 'SLICE',
  View2D_Z: 'SLICE',
}

function createDefaultView(classFactory, ui, options, props) {
  return activateOnCreate(
    createProxyDefinition(
      classFactory,
      ui,
      [
        {
          type: 'application',
          link: 'AnnotationOpacity',
          property: 'annotationOpacity',
          updateOnBind: true,
        },
        {
          type: 'application',
          link: 'OrientationAxesVisibility',
          property: 'orientationAxesVisibility',
          updateOnBind: true,
        },
        {
          type: 'application',
          link: 'OrientationAxesPreset',
          property: 'presetToOrientationAxes',
          updateOnBind: true,
        },
        {
          type: 'application',
          link: 'OrientationAxesType',
          property: 'orientationAxesType',
          updateOnBind: true,
        },
      ],
      options,
      props
    )
  )
}

// ----------------------------------------------------------------------------
export default {
  definitions: {
    Proxy: {
      LookupTable: createProxyDefinition(vtkLookupTableProxy, [], [], {
        presetName: 'Default (Cool to Warm)',
      }),
      PiecewiseFunction: createProxyDefinition(vtkPiecewiseFunctionProxy),
    },
    Widgets: {
      Paint: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkPaintWidget,
        viewTypes: ViewToWidgetTypes,
      }),
    },
    Sources: {
      TrivialProducer: activateOnCreate(createProxyDefinition(vtkProxySource)),
      // differentiate LabelMaps
      LabelMap: createProxyDefinition(vtkProxySource),
    },
    Representations: {
      Geometry: createProxyDefinition(
        vtkGeometryRepresentationProxy,
        proxyUI.Geometry,
        proxyLinks.Geometry
      ),
      Skybox: createProxyDefinition(
        vtkSkyboxRepresentationProxy,
        proxyUI.Skybox,
        proxyLinks.Skybox
      ),
      Molecule: createProxyDefinition(
        vtkMoleculeRepresentationProxy,
        proxyUI.Molecule,
        proxyLinks.Molecule
      ),
      Glyph: createProxyDefinition(
        vtkGlyphRepresentationProxy,
        proxyUI.Glyph,
        proxyLinks.Glyph
      ),
    },
    Views: {
      View3D: createDefaultView(vtkView, proxyUI.View3D),
      View2D: createDefaultView(vtk2DView, proxyUI.View2D),
      View2D_X: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 0 }),
      View2D_Y: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 1 }),
      View2D_Z: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 2 }),
    },
  },
  representations: {
    View3D: proxyViewRepresentationMapping.View3D,
    View2D: proxyViewRepresentationMapping.View2D,
    View2D_X: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceX' },
      vtkLabelMap: { name: 'LabelMapSliceX' },
    },
    View2D_Y: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceY' },
      vtkLabelMap: { name: 'LabelMapSliceY' },
    },
    View2D_Z: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceZ' },
      vtkLabelMap: { name: 'LabelMapSliceZ' },
    },
  },
  filters: {
    vtkPolyData: [],
    vtkImageData: [],
    vtkMolecule: [],
    Glyph: [],
  },
}
