// import { Keyv } from 'keyv';
import { createCache } from "cache-manager";

// Memory store by default
const cache = createCache({ ttl: 600000, refreshThreshold: 20000 });

// Single store which is in memory
// const cache = createCache({
//   stores: [new Keyv()]
// });

export default cache;
