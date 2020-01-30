<template lang="pug">
  #app
    .background.text-white
      .title-bar.pt-2.pb-2.pr-4.flex.items-center.content-between(class="md:text-xl")
        .flex-1
          img.edt-logo(src="@/assets/images/edt-logo.png")
        .flex-1.text-right(class="md:text-center") {{currentTime}}
        .flex-1.text-right {{currentDate}}
      .content-area(class="md:flex-row md:flex md:items-stretch")
        .location.p-4
          ul.list-buttons 
            li 
              button.button(@click="getUserLocation") My location
            li 
              button.button(@click="getLocationFromPresets(40.730610, -73.935242)") New York
            li 
              button.button(@click="getLocationFromPresets(48.864716, 2.349014)") Paris
            li 
              button.button(@click="getLocationFromPresets(30.033333, 31.233334)") Cairo
            li 
              button.button(@click="getLocationFromPresets(22.302711, 114.177216)") Hong Kong
            li 
              button.button(@click="getLocationFromPresets(-34.603722, -58.381592)") Buenos Aires                    
            li(class="text-center w-full md:w-auto md:text-left")
              form(@submit="search" v-on:submit.prevent)
                label.block(class="md:mt-4 mb-1" for="query") Search (address or postal code)
                .flex
                  input(class="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="query" type="text" v-model="searchQuery")
                  button.button-search(type="submit") Search          

        .current.text-center.p-4
          .spinner.mx-auto.my-4(v-if="isLoading")
          div(v-else)
            Current(v-if="Object.keys(currentData).length" :key="currentData.id" v-bind:currentLocationFriendly="this.currentLocationFriendly" v-bind:currentTemp="currentData.currentTemp" v-bind:icon="currentData.icon" v-bind:currentLow="currentData.currentLow" v-bind:currentHigh="currentData.currentHigh"
            v-bind:summary="currentData.summary")

        .activities.flex-1.p-4
          div(v-if="!isLoading")
            div(v-if="Object.keys(activitiesData).length")
              Activities(:key="activitiesData.id" v-bind:kite="activitiesData.kite" v-bind:joggingTemp="activitiesData.joggingTemp" v-bind:joggingPrecip="activitiesData.joggingPrecip" v-bind:skiing="activitiesData.skiing")     
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
            
      .forecast-area.bg-transparent-black.p-6
        div(v-if="!isLoading")
          div(v-if="Object.keys(hourlyData).length")
            h2.text-center.mt-4 Today's forecast
            .flex.justify-center
              Hourly(v-for="hour in hourlyData" :key="hour.id" v-bind:temp="hour.temp" v-bind:time="hour.time" v-bind:icon="hour.icon")

          div(v-if="Object.keys(dailyData).length")
            h2.text-center.mt-4 Forecast for the week
            .flex.justify-center
              Daily(v-for="day in dailyData" :key="day.id" v-bind:time="day.time" v-bind:tempLow="day.tempLow" v-bind:tempHigh="day.tempHigh" v-bind:icon="day.icon")  

</template>

<script>

let apiUrl = 'http://localhost:3001'
// let apiUrl = ''

import Activities from './components/Activities'
import Hourly from './components/Hourly'
import Daily from './components/Daily'
import Current from './components/Current'
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
      currentDate: ''
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
        this.activitiesData.joggingPrecip = data.currently.precipProbability*100
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
        
      let showPosition = (position) =>{
        this.currentLat = position.coords.latitude
        this.currentLong = position.coords.longitude
        this.reverseGeocode(this.currentLat, this.currentLong)
      }

      let showError = () =>{
        this.getLocationFromPresets(40.730610, -73.935242) 
      }
        

        // switch(error.code) {
        //   case error.PERMISSION_DENIED:
        //     alert("User denied the request for Geolocation.")
        //     break;
        //   case error.POSITION_UNAVAILABLE:
        //     alert("Location information is unavailable.")
        //     break;
        //   case error.TIMEOUT:
        //     alert("The request to get user location timed out.")
        //     break;
        //   case error.UNKNOWN_ERROR:
        //     alert("An unknown error occurred.")
        //     break;
        // }
        

      navigator.geolocation.getCurrentPosition(showPosition, showError)
        
    },
    getLocationFromPresets(lat, long) {
      this.currentLat = lat
      this.currentLong = long
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
        return `${distance.toFixed(0)} Miles`
      } else {
        return `${(distance * 1.60934).toFixed(0) } Kilometers`
      }
    },
    rulerUnits(distance) {
      distance = parseFloat(distance)

      if (this.isImperial === "True") {
        return `${distance.toFixed(0)} Inches`
      } else {
        return `${(distance * 2.54).toFixed(0) } Centimeters`
      }
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
