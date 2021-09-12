import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { ThemeDefinition } from 'vuetify/composables'
import 'vuetify/styles'
import { UserModule } from '~/types'

const appLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#0d2a5c',
    accent: '#3d82f0',
    // secondary: colors.blue.base,
    // info: colors.teal.base,
    warning: '#f4ae69',
    error: '#f56a53',
    success: '#00a978',
  },
  icons: {
    iconfont: 'mdiSvg',
  },
  variables: '~/styles/variables.scss',
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
