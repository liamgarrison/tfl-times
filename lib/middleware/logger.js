const morgan = require('morgan');

module.exports = function () {
  return morgan('combined');
};
