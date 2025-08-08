import { Redis } from '@upstash/redis';

// Use mock Redis for local development if Upstash credentials are not set
const hasRedisCredentials = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

export const redis = hasRedisCredentials 
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    })
  : require('./redis-mock').redis;
