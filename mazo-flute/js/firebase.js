/* =============================================
   firebase.js — Inicialização do Firebase
   ============================================= */

'use strict';

const firebaseConfig = {
  apiKey:            "AIzaSyA-Xar78wLCHAaYA5W0paI7xF76vWkenys",
  authDomain:        "mazo-flute.firebaseapp.com",
  projectId:         "mazo-flute",
  storageBucket:     "mazo-flute.firebasestorage.app",
  messagingSenderId: "573983892424",
  appId:             "1:573983892424:web:26ecd8cedc5f9dacb796fd",
};

firebase.initializeApp(firebaseConfig);

// Instância global do Firestore
const db = firebase.firestore();

// Força conexão em rede (evita modo offline persistente)
db.enableNetwork().catch(() => {});
