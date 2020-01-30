<template lang="pug">
  div  
    div {{time}} 
    div {{this.$parent.tempUnits(temp)}}
    div.icon 
      Icon(v-bind:iconTitle="icon")
</template>

<script>
import Icon from './Icon'
export default {
  props: ['time','temp','icon'],
  name: 'Hourly',
  components: {Icon}
}
</script>