'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());

const client = require('./Client');

const handleLocation = require('./handleLocation');
const handleWeather = require('./handleWeather');
const handleYelp = require('./handleYelp');
const handleMovies = require('./handleMovies');
const handleTrails = require('./handleTrails');

const PORT = process.env.PORT || 3003;

//calling handler functions
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);
app.get('/movies', handleMovies);
app.get('/trails', handleTrails);



//404 all unwanted extentions
app.get('*', (request, response) => {
  response.status(404);
});


client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`App is on port ${PORT}`));
  })
  .catch( err => console.error(err));
