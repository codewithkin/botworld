import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true,
});

export default redis;
