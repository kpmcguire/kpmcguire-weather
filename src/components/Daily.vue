<template lang="pug">
  .m-2.daily-wrapper.text-center(class="md:m-4")
    .time {{time}} 
    .icon
      Icon(v-bind:iconTitle="icon")    
    .range
      .whitespace-no-wrap.leading-none
        small lo 
        span.low(v-html="this.$parent.tempUnits(tempLow)") 
      .whitespace-no-wrap.leading-none
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