const app = require('../server/index.js');

module.exports = (req, res) => {
  // If Vercel rewrote the path to /api, restore the original path from headers
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath) {
    req.url = matchedPath;
  }
  return app(req, res);
};
