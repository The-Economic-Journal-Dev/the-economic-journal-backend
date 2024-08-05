import jwt from "jsonwebtoken";
import fs from "fs";

interface JWTCache {
  token: string;
  expiresAt: number;
}

let jwtCache: JWTCache | null = null;
/**
 * Generates a JSON Web Token (JWT) for GitHub App authentication.
 *
 * @async
 * @param {string} pem - The path to the PEM file containing the private key.
 * @param {string} client_id - The client ID of the GitHub App.
 * @returns {Promise<string>} The generated JWT.
 * @throws {Error} Will throw an error if the PEM file cannot be read or JWT generation fails.
 */
const generateJWT = async (pem: string, client_id: string): Promise<string> => {
  // Read PEM file
  const privateKey = fs.readFileSync(pem);
  const now = Math.floor(Date.now() / 1000 - 60) as number;
  const payload = {
    // Issued at time
    iat: now,
    // JWT expiration time (10 minutes maximum)
    exp: now + 600,
    // GitHub App's client ID
    iss: client_id,
    // JWT algorithm
    alg: "RS256",
  };
  // Create JWT
  const encodedJwt = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return encodedJwt;
};

/**
 * Retrieves a JSON Web Token (JWT) for GitHub App authentication.
 * If a cached token exists and is not expired, it returns the cached token;
 * otherwise, it generates a new JWT using the specified PEM file and client ID.
 *
 * @async
 * @returns {Promise<string>} The JWT token.
 * @throws {Error} Will throw an error if there is an issue generating the JWT.
 */
const getJwtToken = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);

  // If we have a cached JWT and it's not expired, return it
  if (jwtCache && jwtCache.expiresAt > now) {
    return jwtCache.token;
  }

  // Otherwise, generate a new JWT
  // Replace with your actual GitHub App's PEM file path
  const pem = "./tej-articles-handler.2024-08-04.private-key.pem";
  const client_id = "Iv23li6XQgbvs6rlfbAb";

  const newToken = await generateJWT(pem, client_id);

  // Cache the new token with its expiration time
  jwtCache = {
    token: newToken,
    expiresAt: now + 600, // 10 minutes from now
  };

  return newToken;
};

export default getJwtToken;
