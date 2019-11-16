const request = require('lib/util/request');
const {omit} = require('lodash');

const appId = process.env.TFL_APPLICATION_ID;
const appKey = process.env.TFL_APPLICATION_KEY;

module.exports = async function getDepartures (from, to, query = {}) {
  const responseRes = await request(`https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${to}`, {
    method: 'get',
    query: {
      ...omit(query, ['from', 'to']),
      app_key: appKey,
      app_id: appId
    }
  });

  if (responseRes.data.journeys) {
    return responseRes.data.journeys.map(journey => {
      return {
        departureTime: journey.startDateTime,
        arrivalTime: journey.arrivalDateTime,
        duration: journey.duration
      };
    });
  }
  else {
    throw new Error('no journey data available');
  }
};
