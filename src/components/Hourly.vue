<template lang="pug">
  .m-5.hour-wrapper.text-center
    .icon 
      Icon(v-bind:iconTitle="icon")
    .temp(v-html="this.$parent.tempUnits(temp)") 
    .time {{time}} 
</template>

<script>
import Icon from './Icon'
export default {
  props: ['time','temp','icon'],
  name: 'Hourly',
  components: {Icon}
}
</script>