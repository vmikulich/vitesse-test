export const USER_ROLES = {
  viewer: 0,
  user: 1,
  superUser: 2,
  admin: 3,
  superAdmin: 4,
}

export const PROJECT_STATUSES_NAMES = {
  0: 'ongoing',
  1: 'problem',
  2: 'finished',
  3: 'closed',
}

export const CASE_STATUSES_NAMES = {
  0: 'created',
  1: 'running',
  2: 'finished',
  3: 'problem',
}

export const VIEW_ORIENTATIONS = {
  default: {
    axis: 1,
    orientation: -1,
    viewUp: [0, 0, 1],
  },
  x: {
    axis: 0,
    orientation: 1,
    viewUp: [0, 0, 1],
  },
  y: {
    axis: 1,
    orientation: -1,
    viewUp: [0, 0, 1],
  },
  z: {
    axis: 2,
    orientation: -1,
    viewUp: [0, -1, 0],
  },
}

export const INTERACTOR_STYLE_DEFINITIOS = [
  { type: 'rotate', options: { button: 1 } }, // Rotate on Left button drag
  { type: 'pan', options: { button: 3 } }, // Pan on Right button drag
  { type: 'pan', options: { button: 1, shift: true } }, // Pan on Shift + Left button drag
  { type: 'roll', options: { button: 1, control: true } }, // Roll on Ctrl + Left button drag
  { type: 'zoom', options: { button: 1, control: true } }, // Zoom on Ctrl + Left button drag
  { type: 'zoom', options: { dragEnabled: false, scrollEnabled: true } }, // Zoom on scroll
]

export const ORIENTATION_LABELS = ['X', 'Y', 'Z']

export const ROTATION_STEP = 2
export const EPSILON = 0.000001
