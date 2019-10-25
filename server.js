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


const City = require('./Location');
const Forecast = require('./Weather');
const Yelp = require('./Yelp');
const Movie = require('./Movie');
const Trail = require('./Trail');

const PORT = process.env.PORT || 3003;

//Get the location and name to be used else where
app.get('/location', (request, response) => {

  const location = request.query.data;
  const sqlQuery = 'SELECT * FROM locations WHERE search_query = $1;';
  const input = [location];

  client.query(sqlQuery, input)
    .then(data => {

      if(data.rows.length === 0){
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;

        superagent.get(url)
          .then(data => {
            const city = new City(location, data.body);
            response.send(city);

            let keyStr = '';
            for (let key in city) {
              keyStr += `${key}, `;
            }

            let storeData = [];
            let sqlData = '';
            let count = 1;
            for (let value in city) {
              storeData.push(city[value]);
              sqlData += `$${count}, `;
              count++;
            }

            keyStr = keyStr.slice(0 , keyStr.length - 2);
            sqlData = sqlData.slice(0 , sqlData.length - 2);

            console.log(keyStr, sqlData, storeData);
            const writeSQL = `INSERT INTO locations (${keyStr}) VALUES ($1, $2, $3, $4) RETURNING *`;
            console.log(writeSQL);
            client.query(writeSQL, storeData)
              .then(() => console.log('Wrote data'))
              .catch(error => console.error(error));

          })
          .catch(error => {
            console.error(error);
            response.send(error).status(500);

          });
      } else {
        console.log('Read Database');
        response.json(data.rows[0]);

      }
    })
    .catch( () => {
      console.log('error');
    });

});


//Create an array of the weather and return that to the webpage
app.get('/weather', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${currentCity.latitude},${currentCity.longitude}`;

  superagent.get(url)
    .then(data => {

      const forecastList = data.body.daily.data.map(dailyWeather => new Forecast(dailyWeather));
      response.send(forecastList);

    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });

});


app.get('/yelp', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.yelp.com/v3/businesses/search?location=${currentCity.search_query}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {

      response.send(data.body.businesses.map(yelp => new Yelp(yelp)));
    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });
});

app.get('/movies', (request, response) => {

  const currentCity = request.query.data;
  // console.log(process.env.TRAIL_API_KEY);
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${currentCity.search_query}&page=1&include_adult=false`;

  superagent.get(url)
    .then(data => {

      response.send(data.body.results.map(movie => new Movie(movie)));

    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });
});

//Create an array of the trails and return that to the webpage
app.get('/trails', (request, response) => {

  const currentCity = request.query.data;
  // console.log(process.env.TRAIL_API_KEY);
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

// /**
//  * End of Path Functions
//  *
//  * Start Helper Functions
//  */

// //Check id location name is in the data base of location names return bool
// function queryDatabase (requestObj) {
// }

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`App is on port ${PORT}`));
  })
  .catch( err => console.error(err));
