<template>
  <v-dialog v-model="status" persistent max-width="420px">
    <v-card>
      <v-card-title class="text-h5">Accept terms</v-card-title>
      <v-card-text class="text-sm">
        <p v-if="isShowTermsText">
          By creating an account, you agree to the
          <a v-if="!props.userTermsStatus" :href="termsLink" target="_blank">
            Terms of Use
          </a>
          <span v-if="!props.licenseTermsStatus">
            and
            <a :href="licenseLink" target="_blank">License Terms</a>.
          </span>
        </p>
        <p v-else>
          An administrator of your organization first needs to accept the
          license terms before you can continue. Please ask your organization
          admin to login on their account and accept the license terms.
        </p>
      </v-card-text>
      <v-card-actions v-if="isShowTermsText">
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="loading" @click="onAccept">
          Agree
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  userTermsStatus: {
    type: Boolean,
    default: false,
  },
  licenseTermsStatus: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

const status = ref(!props.userTermsStatus || !props.licenseTermsStatus)
const loading = ref(false)

const user = computed(() => store.getters['user/getUser'])
const organization = computed(() => store.getters['organization/organization'])
const termsLink = computed(() => store.getters['acceptTerms/termsLink'])
const licenseLink = computed(() => store.getters['acceptTerms/licenseLink'])
const isShowTermsText = computed(() => props.isAdmin || props.licenseTermsStatus)

const onAccept = async() => {
  loading.value = true
  try {
    const userId = user.value.id
    if (!props.userTermsStatus) {
      await store.dispatch('acceptUserTerms', userId)
    }
    if (!props.licenseTermsStatus) {
      await store.dispatch('acceptLicenseTerms', organization.value.id)
    }
    status.value = false
  } finally {
    loading.value = false
  }
}
</script>
