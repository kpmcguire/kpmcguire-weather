<template lang="pug">
  .m-2.daily-wrapper.text-center(md:m-4)
    .time {{time}} 
    .icon
      Icon(v-bind:iconTitle="icon")    
    .range.mb-2
      div 
        small lo 
        span.low(v-html="this.$parent.tempUnits(tempLow)") 
      div
        small hi 
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