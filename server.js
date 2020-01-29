const express = require('express')
const app = express()
const request = require('request')
const serveStatic = require('serve-static')
const cors = require("cors");
app.use(cors())

app.use(serveStatic(__dirname + "/dist")) 

app.get("/darksky/", (req, res) => {
  let lat = req.query.lat
  let long = req.query.long
  let units = req.query.units
  request(
    {
      url: `https://api.darksky.net/forecast/a0a987c912a9e0b51added2abfca96a7/${lat},${long}?units=${units}&exclude=minutely`
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }

      res.json(JSON.parse(body))
    }
  )
})

app.get("/geocode/", (req, res) => {
  let search_query = req.query.search_query
  
  request(
    {
      url: `http://www.datasciencetoolkit.org/maps/api/geocode/json?address=${search_query}`
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }

      res.json(JSON.parse(body))
    }
  )
})

app.get("/reverse_geocode/", (req, res) => {
  let lat = req.query.lat
  let long = req.query.long
  request(
    {
      url: `http://www.datasciencetoolkit.org/coordinates2politics/${lat}%2c${long}`
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }

      res.json(JSON.parse(body))
    }
  )

})

var port = process.env.PORT || 5000
app.listen(port) 
console.log('server started ' + port)
