import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

/**
 * Initialize Firebase Admin SDK.
 * 
 * For production, set the GOOGLE_APPLICATION_CREDENTIALS env var
 * pointing to a service account JSON file, or set FIREBASE_SERVICE_ACCOUNT_JSON
 * with the JSON string directly.
 * 
 * For development, we initialize with just the projectId which allows
 * ID token verification (but not full admin features).
 */
function initFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      logger.info('Firebase Admin initialized with service account');
      return app;
    } catch (err) {
      logger.error({ err }, 'Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON');
    }
  }

  // Fallback: initialize with just projectId (works for verifyIdToken if
  // the Firebase project is correctly configured)
  const app = admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'otp-service-cd1f2',
  });
  logger.info('Firebase Admin initialized with projectId only');
  return app;
}

export const firebaseAdmin = initFirebaseAdmin();
export const firebaseAuth = admin.auth(firebaseAdmin);
