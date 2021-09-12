<template>
  <v-app v-if="showTemplate">
    <TermsOfUse
      v-if="isAcceptWindowVisible"
      :user-terms-status="isTermsOfUseAccepted"
      :license-terms-status="isLicenseTermsAccepted"
      :is-admin="isAdmin"
    />
    <Snackbar />
    <v-app-bar fixed flat app>
      <router-link to="/" class="ml-3">
        <v-img
          src="http://localhost:3000/src/assets/logo.png"
          width="88"
          height="32"
          alt="Diabatix"
          srcset="~/assets/logo@2x.png 2x, ~/assets/logo@3x.png 3x"
        ></v-img>
      </router-link>
      <template v-if="isGranted">
        <v-btn
          type="button"
          color="primary"
          text
          class="mx-2 text-body-2"
          active-class="accent--text"
        >
          Projects
        </v-btn>
        <v-btn
          type="button"
          color="primary"
          text
          class="mx-2 text-body-2"
          active-class="accent--text"
        >
          Libraries
        </v-btn>
        <v-btn
          v-if="isSuperUser || isSuperAdmin"
          type="button"
          color="primary"
          text
          class="mx-2 text-body-2"
          active-class="accent--text"
        >
          Organizations
        </v-btn>
        <v-btn
          v-if="isAdmin || isSuperAdmin"
          type="button"
          color="primary"
          text
          class="mx-2 text-body-2"
          active-class="accent--text"
        >
          Data overview
        </v-btn>
        <v-spacer />
        <template v-if="organization">
          <div class="d-flex text-body-2 mr-4 align-center">
            <v-icon class="mx-2">mdi-cash-multiple</v-icon>
            <span class="accent--text">{{
              organization.credits - organization.creditsInUse
            }}</span>
            <span class="mx-1 text--secondary">/</span>
            <span class="text--secondary" v-text="organization.credits"></span>
          </div>
        </template>
        <v-menu offset-y tile>
          <template #activator="{ on, attrs }">
            <v-btn
              type="button"
              elevation="0"
              large
              text
              class="px-2 rounded-0"
              v-bind="attrs"
              v-on="on"
            >
              <v-tooltip bottom :disabled="true">
                <template #activator="{ on, attrs }">
                  <v-avatar size="34" class="mr-1" v-bind="attrs" v-on="on">
                    <v-icon large>mdi-account-circle</v-icon>
                  </v-avatar>
                </template>
              </v-tooltip>
              <div class="accent--text">
                <div>{{ fullName }}</div>
                <small v-if="organization">{{ organization.name }}</small>
              </div>
              <v-icon x-small class="ml-2 text--secondary">
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item :to="{ name: 'profile' }" :exact="true">
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isSuperAdmin || isAdmin"
              :to="{
                name: 'profile-organizationId',
                params: { organizationId: switchedOrganizationId },
              }"
              :exact="true"
            >
              <v-list-item-title>Company profile</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="switchedOrganizationId !== user.organizationId"
              color="error"
              @click="onSwitchOrganization"
            >
              <v-list-item-title class="error--text">
                Exit company
              </v-list-item-title>
            </v-list-item>
            <v-list-item color="error" @click="logout">
              <v-list-item-title class="error--text">
                Logout
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          class="ma-0"
          text
          icon
          href="https://www.diabatix.com/documentation"
          target="_blank"
        >
          <v-icon>mdi-help-circle</v-icon>
        </v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <v-btn @click="logout">
        Logout
      </v-btn>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import useUser from '~/use/useUser'
import useAuth from '~/use/useAuth'
import useOrganization from '~/use/useOrganization'
import { USER_ROLES as userRoles } from '~/constants/index'

const token = localStorage.getItem('auth._token.auth0')

const router = useRouter()

const {
  user,
  fullName,
  isSuperAdmin,
  isSuperUser,
  isAdmin,
  isTermsOfUseAccepted,
  fetchUser,
} = useUser()
const {
  organization,
  switchedOrganizationId,
  isLicenseTermsAccepted,
  fetchOrganizationProfile,
  setOrganization,
} = useOrganization()
const { isGranted, checkAuthentication, logout, login } = useAuth()

router.beforeEach((to, from, next) => {
  checkAuthentication(token).then(() => {
    if (isGranted.value) {
      return next()
    }
    login()
  })
})

const acceptWindowStatus = ref<boolean>(false)
const showTemplate = ref<boolean>(false)

const isAcceptWindowVisible = computed(() => {
  return (
    acceptWindowStatus.value
    && user.role !== userRoles.superAdmin
    && user.role !== userRoles.superUser
  )
})

onMounted(async() => {
  await checkAuthentication(token)
  await fetchUser(token)
  await fetchOrganizationProfile(user.value.organizationId)
  acceptWindowStatus.value = true
  showTemplate.value = true
})

const onSwitchOrganization = () => {
  setOrganization(null)
  window.location.assign('/')
}
</script>
