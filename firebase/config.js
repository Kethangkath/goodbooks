import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyDDs-3DhOQkxqeIGpt4UbehFB2fbzmRwJA",
    authDomain: "goodbooks-a50ab.firebaseapp.com",
    projectId: "goodbooks-a50ab",
    storageBucket: "goodbooks-a50ab.appspot.com",
    messagingSenderId: "653338727075",
    appId: "1:653338727075:web:9110239aabbb375e3ce516",
    measurementId: "G-SLX88WYCZ5"
  }

  const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)