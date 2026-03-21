// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0iLgYa81pImKl6s5wWVe8p749W-VN5DE",
  authDomain: "porto-1e3f3.firebaseapp.com",
  projectId: "porto-1e3f3",
  storageBucket: "porto-1e3f3.firebasestorage.app",
  messagingSenderId: "958485905019",
  appId: "1:958485905019:web:d9d6b0d0ed938077522cde"
};

// inicializa UMA vez só
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export const auth = getAuth(app);