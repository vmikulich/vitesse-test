import { useStore } from 'vuex'
import { IOrganization } from '~/interfaces/organizations'

export default () => {
  const store = useStore()

  const organization = computed<IOrganization>(() => store.getters['organization/organization'])
  const isLicenseTermsAccepted = computed<boolean>(() => organization.value.licenseTermsAccepted || false)
  const switchedOrganizationId = computed<number>(() => store.getters['organization/switchedOrganizationId'])
  const organizationId = computed<number>(() => {
    return store.getters['user/getUser'].organizationId || store.getters['organization/organizationId']
  })

  const setOrganization = (id: number|null) => {
    store.commit('organization/setOrganization', {
      switchedOrganizationId: id,
    })
  }

  const fetchOrganizationProfile = async(organizationId: number) => {
    await store.dispatch('organization/fetchOrganizationProfile', organizationId)
  }

  const switchOrganization = async(organizationId: number) => {
    await store.dispatch('organization/switchOrganization', organizationId)
  }

  return {
    organization,
    isLicenseTermsAccepted,
    switchedOrganizationId,
    fetchOrganizationProfile,
    switchOrganization,
    setOrganization,
    organizationId,
  }
}
