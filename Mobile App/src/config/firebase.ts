import { getApps, initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize auth with AsyncStorage persistence for React Native session longevity
export const auth = getApps().length === 0 
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);
