<template lang="pug">
  ul
    li Kite: {{this.$parent.distanceUnits(kite)}} per hour
    li Jogging: {{this.$parent.tempUnits(joggingTemp)}} {{joggingPrecip}}% Chance of Precipitation
    li Skiing {{this.$parent.rulerUnits(skiing)}}
</template>

<script>

export default {
  props: ['kite', 'joggingTemp', 'joggingPrecip', 'skiing'],
  name: 'Activities'
}
</script>