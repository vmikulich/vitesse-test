import { SPECTRAL } from '@/paraview/palette'

export const DEFAULT_BACKGROUND = '#f6f7fb'

// Specifications for vtkview background colors, images, and gradients
export const BACKGROUND = [
  '#000000',
  '#ffffff',
  ...SPECTRAL,
  'linear-gradient(#7478BE, #C1C3CA)', // from 3D Slicer default
  'linear-gradient(#00002A, #52576E)', // from ParaView
  DEFAULT_BACKGROUND,
]

export default {
  BACKGROUND,
  DEFAULT_BACKGROUND,
}
