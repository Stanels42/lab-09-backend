'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {console.log('database error');throw err;});

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3003;

//Get the location and name to be used else where
app.get('/location', (request, response) => {
  const location = request.query.data;
  // console.log(location);
  // locationLookup(location, response);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url)
    .then(data => {
      const city = new City(location, data.body);
      response.send(city);
    })
    .catch(error => {
      response.send(error).status(500);
    });
});


//Create an array of the weather and return that to the webpage
app.get('/weather', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${currentCity.latitude},${currentCity.longitude}`;

  superagent.get(url)
    .then(data => {

      const forcastList = data.body.daily.data.map(dailyWeather => new Forcast(dailyWeather));
      response.send(forcastList);

    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });

});


app.get('/yelp', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.yelp.com/v3/businesses/search?location=${currentCity.location}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {

      response.send(data.body);
    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });
});

//Create an array of the trails and return that to the webpage
app.get('/trails', (request, response) => {

  const currentCity = request.query.data;
  console.log(process.env.TRAILS_API_KEY);
  const url = `https://www.hikingproject.com/data/get-trails?lat=${currentCity.latitude}&lon=${currentCity.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then(data => {
      response.send(data.body.trails.map(trail => new Trail(trail)));

    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });
});

//404 all unwanted extentions
app.get('*', (request, responce) => {
  responce.status(404);
});

/**
 * End of Path Functions
 *
 * Start Helper Functions
 */

const City = function (location, data) {

  this.search_query = location;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;

};

function Forcast(day) {

  this.forecast = day.summary;
  let date = new Date(day.time * 1000);
  this.time = date.toDateString();

}

let Trial = function (trailData) {

  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = trailData.conditionStatus;
  let space = trailData.conditionDate.indexOf(' ');
  this.condition_date = trailData.conditionDate.slice(0,space);
  this.condition_time = trailData.conditionDate.slice(space);

};

//Check id location name is in the data base of location names return bool
function locationLookup (locationName, response) {
  locationName = 'seattle';
  const sqlQuery = 'SELECT * FROM locations WHERE search_query = $1';
  const input = [locationName];
  client.query(sqlQuery, input)
    .then(data => {
      console.log(data.rows);
      response.json(data.rows);
    })
    .catch( () => {
      console.log('error');
    });
}

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`App is on port ${PORT}`));
  })
  .catch( err => console.error(err));
