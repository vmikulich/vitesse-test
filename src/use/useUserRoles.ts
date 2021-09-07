import { USER_ROLES } from '~/constants/index'

export default (store) => {
  const isSuperAdmin = computed(() => (
    store.getters['user/getUser'].role === USER_ROLES.superAdmin
    && !store.getters['organization/organizationId']
  ))

  const isSuperUser = computed(() => (
    store.getters['user/getUser'].role === USER_ROLES.superUser
    && !store.getters['organization/organizationId']
  ))

  const isAdmin = computed(() => (
    store.getters['user/getUser'].role === USER_ROLES.admin
    || (store.getters['user/getUser'].role === USER_ROLES.superUser
      && store.getters['organization/organizationId'])
  ))

  return {
    isSuperAdmin,
    isSuperUser,
    isAdmin,
  }
}
