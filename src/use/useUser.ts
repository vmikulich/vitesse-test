import { useStore } from 'vuex'
import { USER_ROLES } from '~/constants/index'
import { IUser } from '~/interfaces/user'

export default () => {
  const store = useStore()

  const user = computed<IUser>(() => store.getters['user/getUser'])
  const fullName = computed<string>(() => `${user.value.firstName} ${user.value.lastName}`)
  const isTermsOfUseAccepted = computed<boolean>(() => user.value.termsOfUseAccepted)
  const isSuperAdmin = computed<boolean>(() => (
    store.getters['user/getUser'].role === USER_ROLES.superAdmin
    && !store.getters['organization/organizationId']
  ))
  const isSuperUser = computed<boolean>(() => (
    store.getters['user/getUser'].role === USER_ROLES.superUser
    && !store.getters['organization/organizationId']
  ))
  const isAdmin = computed<boolean>(() => (
    store.getters['user/getUser'].role === USER_ROLES.admin
    || (store.getters['user/getUser'].role === USER_ROLES.superUser
      && store.getters['organization/organizationId'])
  ))
  const canEdit = computed<boolean>(() => store.getters['user/getUser'].id > 0)

  const fetchUser = async(token: string|null) => {
    await store.dispatch('user/fetchUser', token)
  }

  return {
    user,
    fullName,
    isTermsOfUseAccepted,
    fetchUser,
    isSuperAdmin,
    isSuperUser,
    isAdmin,
    canEdit,
  }
}
