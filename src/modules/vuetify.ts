import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { ThemeDefinition } from 'vuetify/composables'
import 'vuetify/styles'
import { UserModule } from '~/types'

const appLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    'background': '#FFFFFF',
    'surface': '#FFFFFF',
    'primary': '#6200EE',
    'primary-darken-1': '#3700B3',
    'secondary': '#03DAC6',
    'secondary-darken-1': '#018786',
    'error': '#B00020',
    'info': '#2196F3',
    'success': '#4CAF50',
    'warning': '#FB8C00',
  },
  variables: {},
}

export const install: UserModule = ({ app }) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'appLightTheme',
      themes: {
        appLightTheme,
      },
    },
  })

  app.use(vuetify)
}
