<template lang="pug">
  .circle.rounded-full.bg-transparent-black.text-center.p10
    div {{currentLocationFriendly}}
    div Current: {{this.$parent.tempUnits(currentTemp)}}
    div Low: {{this.$parent.tempUnits(currentLow)}}
    div High: {{this.$parent.tempUnits(currentHigh)}}
    .icon.m-auto
      Icon(v-bind:iconTitle="icon")
      div {{summary}}
    
</template>

<script>
import Icon from './Icon'
export default {
  props: ['currentLocationFriendly', 'currentLow', 'currentHigh', 'currentTemp', 'icon', 'summary'],
  name: 'Current',
  components: {Icon}
}
</script>