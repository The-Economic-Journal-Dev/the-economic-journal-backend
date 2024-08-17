import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// TypeScript interface for custom claims
interface CustomClaims {
  role: "admin" | "writer" | "reader";
}

/**
 * Sets custom claims for a user and updates their metadata to force a token refresh.
 *
 * @param {CustomClaims} customClaims - The custom claims to be set.
 * @param {functions.auth.UserRecord} user - The user record for which the claims are to be set.
 * @throws {functions.https.HttpsError} Throws an error if setting claims or updating metadata fails.
 */
const setCustomClaims = async (
  customClaims: CustomClaims,
  user: functions.auth.UserRecord,
) => {
  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(user.uid, customClaims);

    // Update metadata to force a token refresh
    const metadataRef = admin.database().ref(`metadata/${user.uid}`);
    await metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.error("Error setting custom claims or updating metadata:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to set custom claims",
    );
  }
};

/**
 * Cloud Function triggered on user creation to set custom claims based on the user's email domain.
 *
 * @param {functions.auth.UserRecord} user - The user record of the newly created user.
 * @returns {Promise<void>} A promise that resolves when the custom claims are set.
 */
exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  try {
    // Determine custom claims based on the email domain
    let customClaims: CustomClaims;
    if (user.email?.endsWith("@admin.theeconomicjournal.org")) {
      customClaims = { role: "admin" };
    } else if (user.email?.endsWith("@theeconomicjournal.org")) {
      customClaims = { role: "writer" };
    } else {
      customClaims = { role: "reader" };
    }

    // Set custom claims for the user
    await setCustomClaims(customClaims, user);
    console.log(`Custom claims set successfully for user ${user.uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to set custom claims",
    );
  }
});
