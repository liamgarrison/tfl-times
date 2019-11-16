
module.exports = function () {
  return function (req, res) {
    if (res.body === null || res.body === undefined) {
      throw new Error();
    } else {
      res.json(res.body);
    }
  };
};
