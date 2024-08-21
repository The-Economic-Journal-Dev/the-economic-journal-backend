import admin from "firebase-admin";

if (!process.env.FIREBASE_CREDENTIALS) {
  logger.error("Missing Firebase Credentials");
  throwError();
}

const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
logger.info(credentials.client_id);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const auth = admin.auth();

export default admin;
export { auth };
