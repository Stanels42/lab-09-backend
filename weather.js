'use strict';

function Forecast(day) {

  this.forecast = day.summary;
  this.time = !isNaN(day.time) ? new Date(day.time * 1000).toDateString() : day.time;

}

module.exports = Forecast;
