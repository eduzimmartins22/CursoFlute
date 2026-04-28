/* =============================================
   main.js — Bootstrap da aplicação.
   Ponto de entrada: inicializa tudo na ordem
   correta após o DOM estar pronto.
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar dados persistidos (alunos demo)
  Storage.initStudents();

  // 2. Verificar sessão salva (auto-login)
  Auth.checkPersistedSession();
});
