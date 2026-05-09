import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBo-QxqxbeP1CFzVsIh9UL3WlKXoiq7Fxc",
  authDomain: "otp-service-cd1f2.firebaseapp.com",
  projectId: "otp-service-cd1f2",
  storageBucket: "otp-service-cd1f2.firebasestorage.app",
  messagingSenderId: "390819207417",
  appId: "1:390819207417:web:be271d809adeeafc71aa28",
  measurementId: "G-9C7EB07DGK"
};

// Guard against hot-reload double-initialization (fixes auth/already-initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
export const auth = getAuth(app);
