// src/middleware/cache.middleware.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 320 
});

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // No cachear si es una petición autenticada
    if (req.user) {
      return next();
    }

    const key = `__express__${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    next();
  };
};

module.exports = { cache, cacheMiddleware };