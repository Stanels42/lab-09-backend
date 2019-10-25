

CREATE TABLE IF NOT EXISTS weather(
  id SERIAL PRIMARY KEY,
  summary VARCHAR(255),
  time VARCHAR(255)
  );
  
  CREATE TABLE IF NOT EXISTS yelp(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255),
  price VARCHAR(255),
  rating VARCHAR(255),
  url VARCHAR(255)
  );
  
  CREATE TABLE IF NOT EXISTS movies(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  overview VARCHAR(255),
  vote_average VARCHAR(255),
  vote_count VARCHAR(255),
  vote_count VARCHAR(255),
  vote_count VARCHAR(255),
  
  );
  
  CREATE TABLE IF NOT EXISTS trails(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC,
  longitude NUMERIC
  );

  DROP TABLE weather;
DROP TABLE yelp;
DROP TABLE movies;
DROP TABLE trails;

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url)
    .then(data => {
      const city = new City(location, data.body);
      // console.log(city);
      response.send(city);
    })
    .catch(error => {
      response.send(error).status(500);
    });