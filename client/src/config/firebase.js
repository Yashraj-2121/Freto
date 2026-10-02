import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjNJUEe5bvC1yAXT6XIq302DNITkfgBRc",
  authDomain: "freto-freight.firebaseapp.com",
  projectId: "freto-freight",
  storageBucket: "freto-freight.firebasestorage.app",
  messagingSenderId: "255571032618",
  appId: "1:255571032618:web:81071f26c9d11d6761a153",
  measurementId: "G-5TJN1TTQ5C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
