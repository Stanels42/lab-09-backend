'use strict';

require('dotenv').config();

const superagent = require('superagent');

let Trail = function (trailData) {

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

function handleTrails(request, response){

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
}

module.exports = handleTrails;
