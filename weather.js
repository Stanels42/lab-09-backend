'use strict';

const superagent = require('superagent');

function Forecast(day) {

  this.forecast = day.summary;
  this.time = !isNaN(day.time) ? new Date(day.time * 1000).toDateString() : day.time;

}

function handleWeather(request, response){

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

}


module.exports = Forecast;
