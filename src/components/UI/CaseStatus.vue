<template>
  <div shrink>
    <span v-if="status === 0" class="d-flex created">Created</span>
    <span v-if="status === 1" class="d-flex text-no-wrap running">
      <span class="label">Running</span>
      <v-img src="/assets/running.svg" max-width="24" max-height="24"></v-img>
    </span>
    <span v-if="props.status === 2" class="d-flex text-no-wrap finished">
      <span class="label">Finished</span>
      <v-img src="/assets/finished.svg" max-width="24" max-height="24"></v-img>
    </span>
    <span v-if="props.status === 3" class="d-flex text-no-wrap stalled">
      <span class="label">Stalled</span>
      <v-img src="/assets/stalled.svg" max-width="24" max-height="24"></v-img>
    </span>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  status: {
    type: Number,
    default: 0,
  },
})
</script>

<style scoped>
.created {
  color: #f4ae69;
}
.stalled {
  color: #f56a53;
}
.running {
  color: #3d82f0;
}
.finished {
  color: #00a978;
}
.label {
  min-width: 80px;
}
</style>
