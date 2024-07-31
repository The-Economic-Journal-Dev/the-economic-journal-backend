import NodeCache from "node-cache";
import { IArticle, ArticleModel } from "../models/ArticleModel";

/**
 * Initiate the in-memory cache with the latest number of articles (default 100)
 * @param {number} numberOfArticlesCached - The number of articles to be cached. Defaults to 100.
 * @returns {Promise<void>} - Promise resolved when done
 */
const initiateCache = async (
  numberOfArticlesCached: number,
): Promise<void> => {};

// Create a cache instance with a default TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

const cacheArticles = async (article: IArticle) => {};
const retrieveCachedArticle = async () => {};
const invalidateArticleCache = async () => {};

export default cache;
