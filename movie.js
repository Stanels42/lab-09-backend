'use strict';

require('dotenv').config();

const superagent = require('superagent');

let Movie = function(movieData) {

  this.title = movieData.title;
  this.overview = movieData.overview;
  this.average_votes = movieData.vote_average;
  this.total_votes = movieData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
  this.popularity = movieData.popularity;
  this.released_on = movieData.release_date;

};

function handleMovies(request, response){

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
}


module.exports = handleMovies;
