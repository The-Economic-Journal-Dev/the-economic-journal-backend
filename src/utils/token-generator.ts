import crypto from "crypto";

/**
 * Asynchronously generates a random string of the specified length, encoded in Base64URL format.
 * @param length - The length of the desired Base64URL encoded string.
 * @returns Promise<string> - A promise that resolves to the Base64URL encoded string of the specified length.
 */
const randomStringAsBase64Url = async (length: number): Promise<string> => {
  // Calculate the number of bytes needed to generate a Base64URL string of the specified length
  const bytes = Math.ceil((length * 3) / 4);

  // Generate the random bytes asynchronously
  const randomBytes = await new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(bytes, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });

  // Encode the random bytes to Base64URL and return the string truncated to the specified length
  return randomBytes.toString("base64url").slice(0, length);
};

/**
 * Function to generate a random token using Base64URL encoding.
 * @param length - The length of the random token to generate.
 * @returns Promise<string> - A promise that resolves to the generated random token.
 */
const generateRandomToken = async (length: number): Promise<string> => {
  try {
    const token = await randomStringAsBase64Url(length);
    return token;
  } catch (error) {
    console.error("Error generating random token:", error);
    throw new Error("Failed to generate random token");
  }
};

/**
 * Generates a 6-digit verification code.
 * @returns {Promise<string>} A promise that resolves to a 6-digit verification code as a string.
 */
const generateVerificationCode = async (): Promise<string> => {
  return new Promise((resolve) => {
    // Generate a random number between 100000 and 999999
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    resolve(verificationCode);
  });
};

export { generateVerificationCode, generateRandomToken };
