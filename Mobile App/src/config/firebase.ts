import { initializeApp } from 'firebase/app';
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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
