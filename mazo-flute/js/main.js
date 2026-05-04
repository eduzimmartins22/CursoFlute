/* =============================================
   main.js — Bootstrap da aplicação.
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  // Firestore já inicializado pelo firebase.js
  Storage.initStudents();
  // Verifica sessão salva com revalidação no Firestore
  await Auth.checkPersistedSession();
});
