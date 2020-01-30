<template lang="pug">
  dl
    dt.font-bold Kite Flying 
    dd {{this.$parent.distanceUnits(kite)}} / hr
    dt.font-bold Jogging
    dd
      span(v-html="this.$parent.tempUnits(joggingTemp)")
      span 
        | , {{joggingPrecip}}% 
        abbr.cursor-help(title="Probability of Precipitation") PoP
    dt.font-bold Skiing
    dd {{this.$parent.rulerUnits(skiing)}}
</template>

<script>

export default {
  props: ['kite', 'joggingTemp', 'joggingPrecip', 'skiing'],
  name: 'Activities'
}
</script>