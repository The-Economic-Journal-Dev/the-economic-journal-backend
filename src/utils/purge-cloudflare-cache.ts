import axios from "axios";

/**
 * Represents the result of a cache purge request to Cloudflare.
 */
interface PurgeCacheResponse {
  errors: any[]; // Array of error messages, if any
  messages: any[]; // Array of messages, if any
  success: boolean; // Indicates whether the request was successful
  result: {
    id: string; // The ID of the purge request
  };
}

/**
 * Purges the specified cache from Cloudflare via the specified prefix
 * @param uriPath the uri path to the cached item. Must specify the beginning "/" character
 */
const purgeCloudflareCacheByPrefix = async (
  uriPath: String,
  domain?: String,
) => {
  if (!process.env.DOMAIN) {
    throwError();
  }
  if (!domain) {
    domain = process.env.DOMAIN;
  }
  if (
    !process.env.CLOUDFLARE_ZONE_ID ||
    !process.env.CLOUDFLARE_CACHE_PURGE_API_TOKEN
  ) {
    logger.error(
      "Missing Cloudflare credentials: CLOUDFLARE_ZONE_ID or CLOUDFLARE_CACHE_PURGE_API_TOKEN",
    );
    throwError();
  }

  // Define the Cloudflare API endpoint and headers
  const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CLOUDFLARE_CACHE_PURGE_API_TOKEN}`,
  };
  const data = {
    prefixes: [`www.${domain}${uriPath}}`],
  };
  const response: PurgeCacheResponse = await axios.post(url, data, {
    headers,
  });

  if (response.success) {
    logger.info("Cloudflare cache purged successfully");
    return response;
  } else {
    logger.error(
      `Failed to purge Cloudflare cache: ${JSON.stringify(response.errors)}`,
    );
    throwError();
  }
};

export default purgeCloudflareCacheByPrefix;
export { PurgeCacheResponse };
