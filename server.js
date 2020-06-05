const express = require('express')
const app = express()
const request = require('request')
const serveStatic = require('serve-static')
const cors = require('cors')
const dotenv = require('dotenv').config()


var whitelist = [
  `http://localhost:${process.env.VUE_APP_PORT}`,
  `https://localhost:${process.env.VUE_APP_PORT}`,
  `https://${process.env.VUE_APP_LIVE_URL}/`,
  `http://${process.env.VUE_APP_LIVE_URL}/`
];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};



app.use(serveStatic(__dirname + "/dist", cors(corsOptions))) 

app.use("/darksky/", cors(corsOptions), function (req, res) {
  let lat = req.query.lat;
  let long = req.query.long;
  var url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${long}?&exclude=minutely`;
  req.pipe(request(url)).pipe(res);
});

app.use("/geocode/", cors(corsOptions), (req, res) => {
  let search_query = req.query.search_query;
  var url = `https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPENCAGE_API_KEY}&q=${search_query}&pretty=1`;
  req.pipe(request(url)).pipe(res);
});

app.use("/reverse_geocode/", cors(corsOptions), (req, res) => {
  let lat = req.query.lat
  let long = req.query.long
  url = `https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPENCAGE_API_KEY}&q=${lat}%2C${long}&pretty=1&no_annotations=1`
  req.pipe(request(url)).pipe(res)
})

var port = process.env.PORT || 5000

// if (process.env.NODE_ENV === "development") {
//   port = 3001;
// }

app.listen(port) 
console.log('server started ' + port)
