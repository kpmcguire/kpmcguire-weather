<template lang="pug">
  .m-4.daily-wrapper.text-center
    .time {{time}} 
    .icon
      Icon(v-bind:iconTitle="icon")    
    .range.mb-2
      div 
        small low 
        span.low(v-html="this.$parent.tempUnits(tempLow)") 
      div
        small high 
        span.high(v-html="this.$parent.tempUnits(tempHigh)") 

</template>

<script>
import Icon from './Icon'
export default {
  props: ['time', 'tempLow', 'tempHigh', 'icon'],
  name: 'Daily',
  components: {Icon}
}
</script>