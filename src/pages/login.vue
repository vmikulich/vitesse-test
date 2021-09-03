<template>
  <p>Signing in...</p>
</template>
<script>
export default {
  auth: 'guest',
  layout: 'empty',
  middleware: ({ $auth }) => $auth.loginWith('auth0'),
}
</script>
