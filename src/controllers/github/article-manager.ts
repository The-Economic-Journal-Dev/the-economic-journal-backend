import axios, { AxiosError } from "axios";
import getJwtToken from "../../utils/github-app-jwt-generator";
import { StatusCodes } from "http-status-codes";

const owner =
  process.env.GITHUB_ORGANIZATION ||
  throwError("You must set GITHUB_ORGANIZATION env variable");
const repo =
  process.env.DIST_REPO || throwError("You must set DIST_REPO env variable");

// TODO: go though github REST api docs and enforce best practices
// LINK: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28
/**
 * Retrieves headers for GitHub API requests with an access token.
 *
 * @async
 * @returns {Promise<{headers: {Accept: string, Authorization: string, "X-GitHub-Api-Version": string}}>}
 * An object containing the headers for GitHub API requests.
 * @throws Will throw an error if the request for the access token fails.
 */
const getHeaders = async (): Promise<{
  headers: {
    Accept: string;
    Authorization: string;
    "X-GitHub-Api-Version": string;
  };
}> => {
  const response = await axios.post(
    `https://api.github.com/app/installations/53459338/access_tokens`,
    {},
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${await getJwtToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const token = response.data.token;

  return {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };
};

/**
 * Retrieves the SHA hash of a file blob from a GitHub repository.
 *
 * @async
 * @param {string} fileKey - The key of the file to retrieve SHA for.
 * @returns {Promise<string>} The SHA hash of the file blob.
 * @throws {Error} Will throw an error if the file is not found.
 */
const getFileBlobSHA = async (fileKey: string) => {
  const headers = await getHeaders();

  const path = `articles/${fileKey}.html`;

  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    headers,
  );

  const fileSHA = response.data.sha;

  if (!fileSHA) {
    logger.info("File not found");
    throwError("File not found", StatusCodes.NOT_FOUND);
  }

  return fileSHA;
};

/**
 * Uploads a new article to a GitHub repository.
 *
 * This function takes an article key and its HTML content, encodes the content to base64,
 * and then uses the GitHub API to create a new file in the repository.
 *
 * @async
 * @function uploadNewArticle
 * @param {string} articleKey - The unique identifier for the new article, used in the file name.
 * @param {string} articleHtmlContent - The HTML content of the new article to be uploaded.
 * @throws {Error} Throws an error if the file upload to GitHub fails.
 *
 * @example
 * uploadNewArticle('new-article', '<h1>New Article Content</h1>')
 *   .then(() => console.log('New article uploaded successfully'))
 *   .catch((error) => console.error('Failed to upload new article:', error));
 */
const uploadNewArticle = async (
  articleKey: string,
  articleHtmlContent: string,
) => {
  const base64Content = Buffer.from(articleHtmlContent).toString("base64");

  const data = {
    message: `Add new article: ${articleKey}`,
    content: base64Content,
  };

  const headers = await getHeaders();

  const path = `articles/${articleKey}.html`;

  axios
    .put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      data,
      headers,
    )
    .then((response) => {
      logger.info("Success:", response.data);
    })
    .catch((error) => {
      logger.error("Error uploading file to github:", error.response.data);
      throwError("Error uploading file");
    });
};

/**
 * Updates an article in a GitHub repository.
 *
 * This function takes an article key and its HTML content, encodes the content to base64,
 * and then uses the GitHub API to update the file in the repository.
 *
 * @async
 * @function updateArticle
 * @param {string} articleKey - The unique identifier for the article, used in the file name.
 * @param {string} articleHtmlContent - The HTML content of the article to be updated.
 * @throws {Error} Throws an error if the file upload to GitHub fails.
 *
 * @example
 * updateArticle('my-article', '<h1>Updated Article Content</h1>')
 *   .then(() => console.log('Article updated successfully'))
 *   .catch((error) => console.error('Failed to update article:', error));
 */
const updateArticle = async (
  articleKey: string,
  articleHtmlContent: string,
) => {
  const base64Content = Buffer.from(articleHtmlContent).toString("base64");

  const data = {
    message: `Edited article: ${articleKey}`,
    content: base64Content,
    sha: await getFileBlobSHA(articleKey),
  };

  const headers = await getHeaders();

  const path = `articles/${articleKey}.html`;

  axios
    .put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      data,
      headers,
    )
    .then((response) => {
      logger.info("Success:", response.data);
    })
    .catch((error) => {
      logger.error("Error uploading file to github:", error.response.data);
      throwError();
    });
};

/**
 * Deletes an article from a GitHub repository.
 *
 * @async
 * @param {string} articleKey - The key of the article to delete.
 * @throws {Error} Will throw an error if there is an issue fetching the file SHA or deleting the article.
 */
const removeArticle = async (articleKey: string) => {
  const data = {
    message: `Deleted article: ${articleKey}`,
    sha: await getFileBlobSHA(articleKey),
  };

  const headers = await getHeaders();

  const path = `articles/${articleKey}.html`;

  axios
    .delete(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      headers,
    )
    .then((response) => {
      logger.info("Success:", response.data);
    })
    .catch((error) => {
      logger.error("Error uploading file to github:", error.response.data);
      throwError();
    });
};

export { uploadNewArticle, updateArticle, removeArticle };
