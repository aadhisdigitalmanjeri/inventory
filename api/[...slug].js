const app = require('../server/index.js');

module.exports = (req, res) => {
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath) {
    req.url = matchedPath;
  }
  return app(req, res);
};
