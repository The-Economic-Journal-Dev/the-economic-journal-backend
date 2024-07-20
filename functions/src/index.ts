import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const setCustomClaims = async (
  customClaims: Object,
  user: functions.auth.UserRecord,
) => {
  try {
    // Set custom user claims on this newly created user.
    await admin.auth().setCustomUserClaims(user.uid, customClaims);

    // Update real-time database to notify client to force refresh.
    const metadataRef = admin.database().ref("metadata/" + user.uid);

    // Set the refresh time to the current UTC timestamp.
    // This will be captured on the client to force a token refresh.
    await metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.error("Error setting custom claims or updating metadata:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to set custom claims",
    );
  }
};

// On sign up.
exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  // Set custom claims for the user.
  try {
    // Determine role based on email domain.
    let customClaims;
    if (user.email && user.email.endsWith("@admin.derpdevstuffs.org")) {
      customClaims = { role: "admin" };
    } else if (user.email && user.email.endsWith("@derpdevstuffs.org")) {
      customClaims = { role: "writer" };
    } else {
      customClaims = { role: "reader" };
    }
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
