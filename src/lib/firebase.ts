import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCl636CYERP6N2ETNML_50Jx5YRgQZASoY',
  authDomain: 'firewall-request-pilot.firebaseapp.com',
  projectId: 'firewall-request-pilot',
  storageBucket: 'firewall-request-pilot.firebasestorage.app',
  messagingSenderId: '980599472865',
  appId: '1:980599472865:web:1400fd941e2a127285eda0',
  measurementId: 'G-TMFM2K40X0',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
