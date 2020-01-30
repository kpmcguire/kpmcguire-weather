<template lang="pug">
  ul 
    li {{time}} 
    li {{this.$parent.tempUnits(tempLow)}}
    li {{this.$parent.tempUnits(tempHigh)}}
    li.icon 
      Icon(v-bind:iconTitle="icon")
</template>

<script>
import Icon from './Icon'
export default {
  props: ['time', 'tempLow', 'tempHigh', 'icon'],
  name: 'Daily',
  components: {Icon}
}
</script>