import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvdr2EaXtg_VW8YAiHAZ9rgwADhOhQuKo",
  authDomain: "rem-sleep-measure-2.firebaseapp.com",
  projectId: "rem-sleep-measure-2",
  storageBucket: "rem-sleep-measure-2.firebasestorage.app",
  messagingSenderId: "1030200309132",
  appId: "1:1030200309132:web:7c76ceefddd86486ea52a9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
