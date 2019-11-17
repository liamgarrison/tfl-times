const request = require('lib/util/request');
const {omit, chain} = require('lodash');
const {DateTime} = require('luxon');

const appId = process.env.TFL_APPLICATION_ID;
const appKey = process.env.TFL_APPLICATION_KEY;

function getMinutesFromNow (dateString) {
  return Math.round((new Date(dateString).getTime() - Date.now()) / 60000);
}

module.exports = async function getDepartures (from, to, query = {}) {

  if (query.timeOffset === undefined || query.timeOffset === null || query.timeOffset === '') {
    query.timeOffset = 10;
  }

  function getTimes (timeOffset) {
    console.log(timeOffset);
    return request(`https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${to}`, {
      method: 'get',
      query: {
        time: DateTime.local().setZone('Europe/London').plus({ minutes: timeOffset }).toFormat('HHmm'),
        date: DateTime.local().setZone('Europe/London').plus({ minutes: timeOffset }).toFormat('yyyyMMdd'),
        ...omit(query, ['from', 'to']),
        app_key: appKey,
        app_id: appId,
        alternativeWalking: false,
        useMultiModalCall: false
      }
    });
  }

  const times1 = await getTimes(query.timeOffset);
  const times1Journeys = times1.data.journeys;
  const times1LastJourney = times1Journeys[times1Journeys.length - 1];
  console.log(times1LastJourney);
  const times2 = await getTimes(getMinutesFromNow(times1LastJourney.startDateTime));
  const times2Journeys = times2.data.journeys;
  const times2LastJourney = times2Journeys[times2Journeys.length - 1];
  console.log(times2LastJourney);

  const times3 = await getTimes(getMinutesFromNow(times2LastJourney.startDateTime));
  const times3Journeys = times3.data.journeys;
 

  return chain([...times1Journeys, ...times2Journeys, ...times3Journeys])
  .map(journey => {
    return {
      departureTime: journey.startDateTime,
      arrivalTime: journey.arrivalDateTime,
      duration: journey.duration,
      departureTimeFormatted: DateTime.fromISO(journey.startDateTime, { zone: 'Europe/London' }).toLocaleString(DateTime.TIME_24_SIMPLE),
      arrivalTimeFormatted: DateTime.fromISO(journey.arrivalDateTime, { zone: 'Europe/London' }).toLocaleString(DateTime.TIME_24_SIMPLE)
    };
  })
  .filter(journey => {
    console.log(journey);
    return DateTime.fromISO(journey.departureTime) >= DateTime.local();
  })
  .uniqBy(journey => journey.departureTime)
  .sortBy(journey => new Date(journey.departureTime).getTime())
  .slice(0, 3)
  .value();
};
