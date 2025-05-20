const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  enableAutoPipelining: true,
  maxRetriesPerRequest: 3,
});

module.exports = redis;
