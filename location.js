'use strict';

const superagent = require('superagent');
const client = require('./Client');

const City = function (location, data) {

  this.search_query = location;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;

};

function handleLocation (request, response) {

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

}
module.exports = City;

