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
    query.timeOffset = 5;
  }

  function getTimes (timeOffset) {
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

  let res = await getTimes(query.timeOffset);
  const times1Journeys = res.data.journeys;
  let times2Journeys = [];
  let times3Journeys = [];
  let times4Journeys = [];
  let times5Journeys = [];

  const times1LastJourney = times1Journeys && times1Journeys.length > 0 ? times1Journeys[times1Journeys.length - 1] : null;
  if (times1LastJourney) {
    res = await getTimes(getMinutesFromNow(times1LastJourney.startDateTime));
    times2Journeys = res.data.journeys || times2Journeys;
  }
  console.log(times1LastJourney.startDateTime);

  const times2LastJourney = times2Journeys && times2Journeys.length > 0 ? times2Journeys[times2Journeys.length - 1] : null;
  if (times2LastJourney) {
    res = await getTimes(getMinutesFromNow(times2LastJourney.startDateTime));
    times3Journeys = res.data.journeys || times3Journeys;
  }
  console.log(times2LastJourney.startDateTime);

  const times3LastJourney = times3Journeys && times3Journeys.length > 0 ? times3Journeys[times3Journeys.length - 1] : null;
  if (times3LastJourney) {
    res = await getTimes(getMinutesFromNow(times3LastJourney.startDateTime));
    times4Journeys = res.data.journeys || times4Journeys;
  }

  console.log(times3LastJourney.startDateTime);

  const times4LastJourney = times4Journeys && times4Journeys.length > 0 ? times4Journeys[times4Journeys.length - 1] : null;
  if (times4LastJourney) {
    res = await getTimes(getMinutesFromNow(times4LastJourney.startDateTime));
    times5Journeys = res.data.journeys || times5Journeys;
  }

  console.log(times4LastJourney.startDateTime);
 
  return chain([...times1Journeys, ...times2Journeys, ...times3Journeys, ...times4Journeys, ...times5Journeys])
  .map(journey => {
    return {
      departureTime: journey.startDateTime,
      arrivalTime: journey.arrivalDateTime,
      duration: `${journey.duration}`, // needs to be a string for the arduino to display correctly
      departureTimeFormatted: DateTime.fromISO(journey.startDateTime, { zone: 'Europe/London' }).toLocaleString(DateTime.TIME_24_SIMPLE),
      arrivalTimeFormatted: DateTime.fromISO(journey.arrivalDateTime, { zone: 'Europe/London' }).toLocaleString(DateTime.TIME_24_SIMPLE),
      timeUntilDeparture: `${getMinutesFromNow(journey.startDateTime)}`
    };
  })
  .filter(journey => {
    return DateTime.fromISO(journey.departureTime) >= DateTime.local().setZone('Europe/London').plus({ minutes: query.timeOffset });
  })
  .uniqBy(journey => journey.departureTime)
  .sortBy(journey => new Date(journey.departureTime).getTime())
  .slice(0, 3)
  .value();
};
