const getDepartures = require('lib/services/tfl/get_departures');

module.exports = [
  {
    method: 'get',
    path: '/departures',
    handler: async function (req) {  
      const departures = await getDepartures(req.query.from, req.query.to, {
        ...req.query
      });
      return departures;
    }
  }
];
