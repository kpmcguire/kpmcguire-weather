<template lang="pug">
  #app
    h1(v-if="isLoading") Weather
    button(@click="getUserLocation") Get My location
    p or

    input(id="query" type="text" v-model="searchQuery")
    button(@click="search") Search

    p or

    button(@click="getLocationFromPresets(40.730610, -73.935242)") New York
    button(@click="getLocationFromPresets(41.881832, -87.623177)") Chicago
    
    div
      input(type="radio" id="isFahrenheitTrue" value="True" v-model="isFahrenheit")
      label(for="isFahrenheitTrue") ℉
      input(type="radio" id="isFahrenheitFalse" value="False" v-model="isFahrenheit")
      label(for="isFahrenheitFalse") ℃
    div
      input(type="radio" id="isImperialTrue" value="True" v-model="isImperial")
      label(for="isImperialTrue") Imp.
      input(type="radio" id="isImperialFalse" value="False" v-model="isImperial")
      label(for="isImperialFalse") Met.    

    //- button(id="button" @click="showData") Click Me
    
    div {{searchQuery}}
    div {{currentLat}}
    div {{currentLong}}
    div friendly name: {{currentLocationFriendly}}
    div {{isFahrenheit}}
    div {{isImperial}}
    div {{units}}
    div {{wacky}} {{units}}

    .spinner(v-if="isLoading")
    div(v-else)
      ul(v-for="hour in hourlyData") 
        li {{hour.time}} 
        li {{hour.temp}} 
        li.icon 
          Icon(v-bind:iconTitle="hour.icon")

    ul(v-for="day in dailyData") 
      li {{day.time}} 
      li {{day.tempLow}} 
      li {{day.tempHigh}}  
      li.icon 
        Icon(v-bind:iconTitle="day.icon")


</template>

<script>
import Icon from './components/Icon'
export default {
  name: 'app',
  components: {
    Icon
  },
  data: function() {
    return {
      weatherData: '',
      hourlyData: [],
      dailyData: [],
      searchQuery: '',
      currentLat:'',
      currentLong:'',
      currentLocationFriendly: '',
      isFahrenheit: 'True',
      isImperial: 'True',
      units: 'us',
      wacky: false,
      // isLoading: false,
      isLoadingWeather: false,
      isLoadingGeocoding: false,
      isLoadingReverseGeocoding: false
    }
  },
  methods: {
    showData() {
      
      fetch(`http://localhost:5000/darksky?lat=${this.currentLat}&long=${this.currentLong}&units=${this.units}`)
      .then(response => {
        this.isLoadingWeather = true
        return response.json();
      })
      .then(data => {
        this.hourlyData = []
        this.dailyData = []
        
        let rawHourlyData = Object.values(data.hourly.data)
        rawHourlyData.slice(0,6).forEach((hour)=>{
          let hourObj = {}
          
          hourObj.time = this.convertTime(hour.time)
          hourObj.temp = hour.temperature
          hourObj.icon = hour.icon

          this.hourlyData.push(hourObj)
        })

        let rawDailyData = Object.values(data.daily.data)
        rawDailyData.slice(0,7).forEach((day)=>{
          let dayObj = {}
          
          dayObj.time = this.convertTime(day.time)
          dayObj.tempLow = day.temperatureLow
          dayObj.tempHigh = day.temperatureHigh
          dayObj.icon = day.icon
          
          this.dailyData.push(dayObj)
        })
        this.isLoadingWeather = false

      })
      .catch(err => {
        this.weatherData = err
      });      
    },
    search() {
      this.currentLocationFriendly = ''
      this.geocode(this.searchQuery)
    },
    geocode(query) {
      fetch(`http://localhost:5000/geocode?search_query=${query}`)
      .then(response => {
        this.isLoadingGeocoding = true
        return response.json();
      })
      .then(data => {
        this.currentLat = data.results[0].geometry.location.lat
        this.currentLong = data.results[0].geometry.location.lng

        this.reverseGeocode(this.currentLat, this.currentLong)
        this.isLoadingGeocoding = false

      })
      .catch(err => {
        this.weatherData = err
      });   
    },    
    reverseGeocode(lat, long) {

      fetch(`http://localhost:5000/reverse_geocode?lat=${lat}&long=${long}`)
      .then(response=>{
        this.isLoadingReverseGeocoding = true

        return response.json()
        
      })
      .then((data)=> {
        let values = Object.values(data[0].politics)

        let city, state, country, cityResult, countyResult, stateResult, countryResult
               
        cityResult = values.filter(obj => {
          return obj.friendly_type === 'city'
        })

        countyResult = values.filter(obj => {
          return obj.friendly_type === 'county'
        })

        stateResult = values.filter(obj => {
          return obj.friendly_type === 'state'
        })        

        countryResult = values.filter(obj => {
          return obj.friendly_type === 'country'
        })        
        
        if(typeof cityResult[0] !== 'undefined' && cityResult.length > 0) {
          city = cityResult[0].name
        } else {
          city = `${countyResult[0].name} County`
        }

        state = stateResult[0].name
        country = countryResult[0].name
        this.currentLocationFriendly = `${city} ${state} ${country}`
        this.isLoadingReverseGeocoding = false

      })

    },
    getUserLocation() {
      navigator.geolocation.getCurrentPosition((position) =>{
        this.currentLat = position.coords.latitude
        this.currentLong = position.coords.longitude
        this.reverseGeocode(this.currentLat, this.currentLong)
      })
    },
    getLocationFromPresets(lat, long) {
      this.currentLat = lat
      this.currentLong = long
      this.reverseGeocode(this.currentLat, this.currentLong)
    },
    fahImpCheck() {
      if(this.isFahrenheit === "True" && this.isImperial === "True") {
        this.wacky = false
        return 'us'
      } else if (this.isFahrenheit === "False" && this.isImperial === "True") {
        this.wacky = false
        return 'uk2'
      } else if (this.isFahrenheit === "False" && this.isImperial === "False") {
        this.wacky = false
        return 'ca'
      } else {
        this.wacky = true
        return 'us'
      }
    },
    convertTime(time) {
      let date = new Date(time*1000)
      let day = date.getDay()
      let weekdays_array = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      let hours 

      if (date.getHours() > 12) {
        hours = date.getHours() - 12
      } else if(date.getHours() === 0) {
        hours = 12
      } else {
        hours = date.getHours()
      }

      let am_pm = date.getHours() >= 12 ? 'PM' : 'AM'

      return `${weekdays_array[day]} ${hours} ${am_pm}`
    }
  },
  computed: {
    isLoading() {
       if (this.isLoadingGeocoding || this.isLoadingWeather || this.isLoadingReverseGeocoding) {
         return true
       } else {
         return false
       }
    }
  },
  watch: {
    currentLat() {
      this.showData()
    },
    isFahrenheit() {
      this.units = this.fahImpCheck()
    },
    isImperial() {
      this.units = this.fahImpCheck()      
    },
    units() {
      this.showData()
    }
  }
}
</script>

<style lang="scss">
  @import "@/assets/styles/customizations.scss" 
</style>
