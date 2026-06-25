import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

console.log(`[Redis] Connected to ${process.env.REDIS_URL}`);

export default redis;
