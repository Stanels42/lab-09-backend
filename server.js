'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());

const client = require('./client');

const handleLocation = require('./location');
const handleWeather = require('./weather');
const handleYelp = require('./yelp');
const handleMovies = require('./movie');
const handleTrails = require('./trail');

const PORT = process.env.PORT || 3003;

//calling handler functions
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);
app.get('/movies', handleMovies);
app.get('/trails', handleTrails);

//404 all unwanted extentions
app.get('*', fileNotFound);

function serverError (error) {
  console.error(error);
  response.status(500).send('Server Error');
}

function fileNotFound (request, response) {
  console.error('404 Bad File Path');
  response.status(404).send('Bad File Path');
}

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`App is on port ${PORT}`));
  })
  .catch( err => console.error(err));
