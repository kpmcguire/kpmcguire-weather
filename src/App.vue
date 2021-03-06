<template lang="pug">
  #app
    .background.text-white
      .title-bar.pt-2.pb-2.pr-4.flex.items-center.content-between
        .flex-1
          img.edt-logo(src="@/assets/images/cinco-logo.png")
        .flex-1.text-right(class="md:text-center") {{currentTime}}
        .flex-1.text-right {{currentDate}}
      .content-area(class="md:flex-row md:flex md:items-stretch")
        .location.p-4
          h2 Location
          ul.list-buttons 
            li 
              button.button(@click="getUserLocation" v-bind:class="{selected:selectedCity == 'user'}") My location
            li 
              button.button(@click="getLocationFromPresets(40.730610, -73.935242, 'nyc')" v-bind:class="{selected:selectedCity == 'nyc'}") New York
            li 
              button.button(@click="getLocationFromPresets(48.864716, 2.349014, 'paris')" v-bind:class="{selected:selectedCity == 'paris'}") Paris
            li 
              button.button(@click="getLocationFromPresets(30.033333, 31.233334, 'cairo')" v-bind:class="{selected:selectedCity == 'cairo'}") Cairo
            li 
              button.button(@click="getLocationFromPresets(22.302711, 114.177216, 'hk')" v-bind:class="{selected:selectedCity == 'hk'}") Hong Kong
            li 
              button.button(@click="getLocationFromPresets(-34.603722, -58.381592, 'ba')" v-bind:class="{selected:selectedCity == 'ba'}") Buenos Aires                    
            li(class="text-center w-full md:w-auto md:text-left")
              form(@submit="search" v-on:submit.prevent)
                label.block(class="md:mt-4 mb-1" for="query") Search (address or postal code)
                .flex
                  input(class="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="query" type="text" required v-model="searchQuery")
                  button.button-search(class="focus:outline-none focus:shadow-outline" type="submit") Search          

        .current.text-center.p-4
          .spinner.mx-auto.my-4(v-if="isLoading")
          div(v-else)
            Current(v-if="Object.keys(currentData).length" :key="currentData.id" v-bind:currentLocationFriendly="this.currentLocationFriendly" v-bind:currentTemp="currentData.currentTemp" v-bind:icon="currentData.icon" v-bind:currentLow="currentData.currentLow" v-bind:currentHigh="currentData.currentHigh"
            v-bind:summary="currentData.summary")

        .activities.flex-1.p-4
          div(v-if="!isLoading")
            div(v-if="Object.keys(activitiesData).length")
              Activities(:key="activitiesData.id" v-bind:kite="activitiesData.kite" v-bind:joggingTemp="activitiesData.joggingTemp" v-bind:joggingPrecip="activitiesData.joggingPrecip" v-bind:skiing="activitiesData.skiing")     

      .forecast-area.bg-transparent-black.p-6

        .flex.flex-col(class="md:flex-row")
          .flex-1
          .forecast-area-content(v-if="!isLoading")
            .flex.justify-center.items-center
              h4.text-center.mr-2 Forecast For:
              button.toggle-button(@click="toggleForecast" v-bind:class="{selected: forecastShowWeek}") Today
              button.toggle-button(@click="toggleForecast" v-bind:class="{selected: !forecastShowWeek}") Week

            div(v-if="!isLoading && this.forecastShowWeek")
              .flex.justify-center
                Hourly(v-for="hour in hourlyData" :key="hour.id" v-bind:temp="hour.temp" v-bind:time="hour.time" v-bind:icon="hour.icon")

            div(v-if="!isLoading && !this.forecastShowWeek")
              .flex.justify-center
                Daily(v-for="day in dailyData" :key="day.id" v-bind:time="day.time" v-bind:tempLow="day.tempLow" v-bind:tempHigh="day.tempHigh" v-bind:icon="day.icon")            
          .flex-1.flex.flex-col.justify-center.items-center(class="md:justify-end md:items-end")
            .radio-labels-checked
              input(type="radio" id="isImperialFalse" value="False" v-model="isImperial")
              label(for="isImperialFalse") metric     
              span / 
              input(type="radio" id="isImperialTrue" value="True" v-model="isImperial")
              label(for="isImperialTrue") imperial             
            .radio-labels-checked
              input(type="radio" id="isFahrenheitFalse" value="False" v-model="isFahrenheit")
              label(for="isFahrenheitFalse") °C            
              span /
              input(type="radio" id="isFahrenheitTrue" value="True" v-model="isFahrenheit")
              label(for="isFahrenheitTrue") °F               

</template>

<script>

import Activities from './components/Activities'
import Hourly from './components/Hourly'
import Daily from './components/Daily'
import Current from './components/Current'

let apiUrl

if (process.env.NODE_ENV === 'development') {
  apiUrl = `http://localhost:${process.env.VUE_APP_SERVER_PORT}`
} else {
  apiUrl = ''
}

export default {
  name: 'app',
  components: {
    Hourly, Daily, Activities, Current
  },
  data: function() {
    return {
      weatherData: '',
      hourlyData: [],
      dailyData: [],
      activitiesData: {},
      currentData: {},
      searchQuery: '',
      currentLat:'',
      currentLong:'',
      currentLocationFriendly: '',
      isFahrenheit: 'True',
      isImperial: 'True',
      isLoadingWeather: false,
      isLoadingGeocoding: false,
      isLoadingReverseGeocoding: false,
      currentTime: '',
      currentDate: '',
      forecastShowWeek: true,
      selectedCity: ''
    }
  },
  methods: {
    showData() {
      this.hourlyData = []
      this.dailyData = []
      this.activitiesData = []      
      this.isLoadingWeather = true

      let time = new Date()
      
      let hours = ''
      let mins = time.getMinutes()

      if (mins < 10) {
        mins = `0${mins}`
      }

      if (time.getHours() > 12) {
        hours = time.getHours() - 12
      } else if(time.getHours() === 0) {
        hours = 12
      } else {
        hours = time.getHours()
      }

      let am_pm = time.getHours() >= 12 ? 'PM' : 'AM'      

      this.currentTime = `${hours}:${mins} ${am_pm}`

      let day = time.getDate()
      let month = time.getMonth() + 1
      let year = time.getFullYear()

      this.currentDate = `${month}.${day}.${year}`

      fetch(`${apiUrl}/darksky?lat=${this.currentLat}&long=${this.currentLong}`)
      .then(response => {
        
        return response.json();
      })
      .then(data => {
        
        let hourlyTemps = []
        
        let rawHourlyData = Object.values(data.hourly.data)
        rawHourlyData.slice(0,6).forEach((hour)=>{
          let hourObj = {}
          
          hourObj.time = this.convertTimeShort(hour.time)
          hourObj.temp = `${hour.apparentTemperature}`
          hourlyTemps.push(hourObj.temp)
          hourObj.icon = hour.icon

          this.hourlyData.push(hourObj)
        })

        let rawDailyData = Object.values(data.daily.data)
        rawDailyData.slice(0,7).forEach((day)=>{
          let dayObj = {}
          
          dayObj.time = this.convertTime(day.time)
          dayObj.tempLow = `${day.apparentTemperatureLow}`
          dayObj.tempHigh = `${day.apparentTemperatureHigh}`
          dayObj.icon = day.icon
          
          this.dailyData.push(dayObj)
        })

        this.activitiesData.kite = data.currently.windSpeed
        this.activitiesData.joggingTemp = data.currently.apparentTemperature
        this.activitiesData.joggingPrecip = (data.currently.precipProbability*100).toFixed(0)
        this.activitiesData.skiing = data.currently.precipAccumulation ? data.currently.precipAccumulation : 0

        this.currentData.currentLocationFriendly = this.currentLocationFriendly
        this.currentData.currentTemp = data.currently.apparentTemperature
        this.currentData.icon = data.currently.icon
        this.currentData.summary = data.currently.summary
        this.currentData.currentLow = Math.min(...hourlyTemps)
        this.currentData.currentHigh = Math.max(...hourlyTemps)

        this.isLoadingWeather = false
      })
      .catch(err => {
        this.weatherData = err
      });      
    },
    search() {
      this.currentLocationFriendly = ''
      this.geocode(encodeURIComponent(this.searchQuery))
      this.selectedCity = 'user'
    },
    geocode(query) {
      this.isLoadingGeocoding = true

      fetch(`${apiUrl}/geocode?search_query=${query}`)
      .then(response => {
        return response.json()
      })
      .then(data => {
        let dataArr = data.results

        dataArr.sort(function(a, b){
            if(a.confidence > b.confidence) return -1;
            if(a.confidence < b.confidence) return 1;
            return 0;
        })

        this.currentLat = dataArr[0].geometry.lat
        this.currentLong = dataArr[0].geometry.lng

        this.reverseGeocode(this.currentLat, this.currentLong)
        this.isLoadingGeocoding = false

      })
      .catch(err => {
        this.weatherData = err
      });   
    },    
    reverseGeocode(lat, long) {
      this.hourlyData = []
      this.dailyData = []
      this.activitiesData = [] 
      this.isLoadingReverseGeocoding = true

      fetch(`${apiUrl}/reverse_geocode?lat=${lat}&long=${long}`)
      .then(response=>{
        return response.json();
      })
      .then((data)=> {

        let response = ''

        response = data.results[0].components.city

        if (response === undefined || response === '') {
          response = data.results[0].components.county
        }

        if (response === undefined || response === '') {
          response = data.results[0].components.state
        }        

        if (response === undefined || response === '') {
          response = data.results[0].components.country
        }        

        if (response === undefined || response === '') {
          response = data.results[0].components.continent
        }                

        if (response === undefined || response === '') {
          response = data.results[0].components.body_of_water
        }                        

        this.currentLocationFriendly = `${response}`
        this.showData()
        this.isLoadingReverseGeocoding = false
      })

    },
    getUserLocation() {
      this.selectedCity = 'user'  
        
      let showPosition = (position) =>{
        this.selectedCity = 'user'
        this.currentLat = position.coords.latitude
        this.currentLong = position.coords.longitude
        this.reverseGeocode(this.currentLat, this.currentLong)
      }

      let showError = () =>{
        this.getLocationFromPresets(40.730610, -73.935242, 'nyc') 
      }
      navigator.geolocation.getCurrentPosition(showPosition, showError)
      
    },
    getLocationFromPresets(lat, long, selected) {
      this.currentLat = lat
      this.currentLong = long
      this.selectedCity = selected
      this.reverseGeocode(this.currentLat, this.currentLong)
      this.showData()
    },
    convertTimeShort(time) {
      let date = new Date(time*1000)

      let hours 

      if (date.getHours() > 12) {
        hours = date.getHours() - 12
      } else if(date.getHours() === 0) {
        hours = 12
      } else {
        hours = date.getHours()
      }

      let am_pm = date.getHours() >= 12 ? 'PM' : 'AM'

      return `${hours}${am_pm}`
    },    
    convertTime(time) {
      let date = new Date(time*1000)
      let day = date.getDay()
      let weekdays_array = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return `${weekdays_array[day]}`
    },
    tempUnits(temp) {
      temp = parseFloat(temp)
      if (this.isFahrenheit === "True") {
        return `${temp.toFixed(0)}<span class="degree">°F</span>`
      } else {
        return `${((temp - 32)/1.8000).toFixed(0)}<span class="degree">°C</span>`
      }
    },
    distanceUnits(distance) {
      distance = parseFloat(distance)
      if (this.isImperial === "True") {
        return `${distance.toFixed(0)} m`
      } else {
        return `${(distance * 1.60934).toFixed(0) } km`
      }
    },
    rulerUnits(distance) {
      distance = parseFloat(distance)

      if (this.isImperial === "True") {
        return `${distance.toFixed(0)} in`
      } else {
        return `${(distance * 2.54).toFixed(0) } cm`
      }
    },
    toggleForecast() {
      this.forecastShowWeek = !this.forecastShowWeek
    }
  },

  computed: {
    isLoading() {
       if (this.isLoadingGeocoding || this.isLoadingWeather ||this.isLoadingReverseGeocoding) {
         return true
       } else {
         return false
       }
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.getUserLocation()
    })
  }
}
</script>

<style lang="scss">
  @import "@/assets/styles/customizations.scss" 
</style>
