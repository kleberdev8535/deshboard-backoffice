const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./produtividade.db', (err) => {
  if (err) {
    console.error('Erro ao conectar no DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all('SELECT id, colaborador_id, data, contatados, finalizados, prontuario, ganhos, pendencias, parcial FROM produtividade ORDER BY id', (err, rows) => {
    if (err) {
      console.error('Erro ao ler produtividade:', err.message);
      return;
    }
    console.log('PRODUTIVIDADE ROWS:', JSON.stringify(rows, null, 2));
  });
  db.all('SELECT id, nome, created_at FROM colaboradores ORDER BY id', (err, rows) => {
    if (err) {
      console.error('Erro ao ler colaboradores:', err.message);
      return;
    }
    console.log('COLABORADORES:', JSON.stringify(rows, null, 2));
  });
});

db.close();
