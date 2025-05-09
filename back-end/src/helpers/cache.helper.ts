// import { Keyv } from 'keyv';
import { createCache } from 'cache-manager';

// Memory store by default
export const cache = createCache({
  ttl: 10 * 60 * 1000,
  refreshThreshold: 60 * 1000
}); // 10 minutes, 1 minute

// Single store which is in memory
// const cache = createCache({
//   stores: [new Keyv()]
// });

// export default cache;
