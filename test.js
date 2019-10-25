const Location = {
  city: request.query.data,
  api_url: `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`,
  constructor: City,
  table: 'locations',
  response: response,
};