<template lang="pug">
  img(src="@/assets/images/icons8-sun-500.png" v-if="iconTitle === 'clear-day'")

  img(src="@/assets/images/icons8-moon-and-stars-500.png" v-else-if="iconTitle === 'clear-night'")

  img(src="@/assets/images/icons8-partly-cloudy-day-500.png" v-else-if="iconTitle === 'partly-cloudy-day'")

  img(src="@/assets/images/icons8-night-500.png" v-else-if="iconTitle === 'partly-cloudy-night'")

  img(src="@/assets/images/icons8-clouds-500.png" v-else-if="iconTitle === 'cloudy'")
  
  img(src="@/assets/images/icons8-light-rain-500.png" v-else-if="iconTitle === 'rain'")

  img(src="@/assets/images/icons8-sleet-500.png" v-else-if="iconTitle === 'sleet'")
  
  img(src="@/assets/images/icons8-snow-500.png" v-else-if="iconTitle === 'snow'")

  img(src="@/assets/images/icons8-windy-weather-500.png" v-else-if="iconTitle === 'wind'")

  img(src="@/assets/images/icons8-fog-500.png" v-else-if="iconTitle === 'fog'")  

</template>

<script>
export default {
  props: ['iconTitle'],
  name: 'Icon'
}
</script>