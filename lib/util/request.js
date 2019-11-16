const fetch = require('node-fetch');
const querystring = require('querystring');

module.exports = async function request (path, opts = {}) {
  const options = {
    ...opts
  };

  if (options.data) {
    options.body = JSON.stringify(options.data);
  }

  const url = `${path}?${querystring.stringify(opts.query)}`;
  
  const response = await fetch(url, options);

  if (
    /application\/json/ig.test(response.headers.get('Content-Type'))
  ) {
    response.data = await response.json();
  }

  return response;
};
