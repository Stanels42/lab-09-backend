'use strict';

const superagent = require('superagent');

let Yelp = function(yelpData){
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
};

function handleYelp(request, response){

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
}

module.exports = Yelp;
