import NodeCache from "node-cache";

// Create a cache instance with a default TTL of 1 hour
const dnsCache = new NodeCache({ stdTTL: 3600 });

export default dnsCache;
