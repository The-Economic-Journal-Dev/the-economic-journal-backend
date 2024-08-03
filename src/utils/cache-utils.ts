import { caching, Cache } from "cache-manager";
import { IArticle, ArticleModel } from "../models/ArticleModel";

let cache: Cache;

/**
 * Initializes the cache and fetches initial data.
 * @async
 * @returns {Promise<void>}
 */
const initializeCache = async (): Promise<void> => {
  cache = await caching("memory", {
    max: 100,
    ttl: 15 * 60 * 1000 /*milliseconds*/,
    shouldCloneBeforeSet: false,
    refreshThreshold: 60 * 1000 /*milliseconds*/,
    onBackgroundRefreshError: (error) => {
      logger.error("Error refreshing the memory cache: ");
      if (error instanceof Error) {
        logger.error(error.message);
      }
    },
  });

  const fetchArticlesData = async () => {
    let articleDbQuery = ArticleModel.find()
      .sort({ datePublished: -1 }) // Sort by datePublished descending (latest first)
      .limit(100); // Limit the number of documents returned per page;

    const articles: IArticle[] = await articleDbQuery.exec();

    return articles;
  };

  await cache.wrap(
    "articles",
    () => fetchArticlesData(),
    60 * 60 * 1000,
    60 * 1000,
    {
      nonBlockingSet: true,
    },
  );
};

/**
 * Retrieves a paginated list of cached articles.
 *
 * @async
 * @param {number} page - The page number to retrieve.
 * @param {number} itemsPerPage - The number of items per page.
 * @returns {Promise<{ articles: IArticle[] | undefined, cacheStatus: string }>} A promise that resolves to an object containing the array of articles for the specified page,
 * or `undefined` if the cache is not present, not an array, and a cacheStatus indicating if it was a "hit", "miss", or "stale".
 */
const retrieveCachedArticles = async (
  page: number,
  itemsPerPage: number,
): Promise<{ articles: IArticle[] | undefined; cacheStatus: string }> => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const array = await cache.get("articles");

  if (!array || !Array.isArray(array)) {
    logger.error("Articles cache not present or is not of Array type.");
    return { articles: undefined, cacheStatus: "miss" };
  }

  if (startIndex >= array.length) {
    return { articles: undefined, cacheStatus: "miss" };
  }

  const paginatedItems: IArticle[] = array.slice(startIndex, endIndex);

  return { articles: paginatedItems, cacheStatus: "hit" };
};

export { initializeCache, retrieveCachedArticles };
