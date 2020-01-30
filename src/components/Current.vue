<template lang="pug">
  .circle-wrapper.rounded-full.bg-transparent-black.text-center.my-10
    .circle.items-center.flex.justify-center.leading-none
      div.w-full
        h1.current-location.mb-10 {{currentLocationFriendly}}
        .flex.items-center.justify-around
          .low-high.leading-normal
            div low 
            div(v-html="this.$parent.tempUnits(currentLow)") 

          .current-temp.mb-8(v-html="this.$parent.tempUnits(currentTemp)")
          
          .low-high.leading-normal
            div high 
            div(v-html="this.$parent.tempUnits(currentHigh)") 
        .icon
          Icon(v-bind:iconTitle="icon" class="m-auto")
          .low-high.leading-normal {{summary}}
    
</template>

<script>
import Icon from './Icon'
export default {
  props: ['currentLocationFriendly', 'currentLow', 'currentHigh', 'currentTemp', 'icon', 'summary'],
  name: 'Current',
  components: {Icon}
}
</script>