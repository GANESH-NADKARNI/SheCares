// // import { initializeApp, getApps, getApp } from 'firebase/app';
// // import { getAuth } from 'firebase/auth';
// // import { getFirestore } from 'firebase/firestore';

// // const firebaseConfig = {
// //   apiKey: "AIzaSyBUaDzelmZoluTFRV_gK8MhvI1wAyq-KZU",
// //   authDomain: "davangere-a4f63.firebaseapp.com",
// //   projectId: "davangere-a4f63",
// //   storageBucket: "davangere-a4f63.firebasestorage.app",
// //   messagingSenderId: "556847330974",
// //   appId: "1:556847330974:web:013b694c45a3571d5b6d8f",
// //   measurementId: "G-G9SX1GCKNG"
// // };

// // const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // export const auth = getAuth(app);
// // export const db = getFirestore(app);
// // export default app;
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
// import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyBUaDzelmZoluTFRV_gK8MhvI1wAyq-KZU",
//   authDomain: "davangere-a4f63.firebaseapp.com",
//   projectId: "davangere-a4f63",
//   storageBucket: "davangere-a4f63.firebasestorage.app",
//   messagingSenderId: "556847330974",
//   appId: "1:556847330974:web:013b694c45a3571d5b6d8f",
//   measurementId: "G-G9SX1GCKNG"
// };

// // Initialize Firebase
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // Initialize Auth with persistence
// export const auth = getAuth(app);

// // Set auth persistence (faster subsequent loads)
// setPersistence(auth, browserLocalPersistence).catch((error) => {
//   console.error("Auth persistence error:", error);
// });

// // Initialize Firestore
// export const db = getFirestore(app);

// // Enable offline persistence (optional but recommended)
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code === 'failed-precondition') {
//     console.warn('Multiple tabs open, persistence enabled in first tab only');
//   } else if (err.code === 'unimplemented') {
//     console.warn('Browser doesn\'t support persistence');
//   }
// });

// export default app;
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth + persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

// Firestore + offline support
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open — persistence active in only one tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support persistence.');
  }
});

export default app;
