const express = require('express')
const app = express()
const request = require('request')
const serveStatic = require('serve-static')
const cors = require('cors')
const dotenv = require('dotenv').config()

app.use(cors())

app.use(serveStatic(__dirname + "/dist")) 

app.get("/darksky/", (req, res) => {
  let lat = req.query.lat
  let long = req.query.long
  request(
    {
      url: `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${long}?&exclude=minutely`
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
      url: `https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPENCAGE_API_KEY}&q=${search_query}&pretty=1`
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }

      res.json(JSON.parse(body));
    }
  );
})

app.get("/reverse_geocode/", (req, res) => {
  let lat = req.query.lat
  let long = req.query.long
  request(
    {
      url: `https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPENCAGE_API_KEY}&q=${lat}%2C${long}&pretty=1&no_annotations=1`
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }

      res.json(JSON.parse(body));
    }
  );

})

var port = process.env.PORT || 5000
app.listen(port) 
console.log('server started ' + port)
