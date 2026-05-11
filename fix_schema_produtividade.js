const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./produtividade.db');

db.serialize(() => {
  db.run('PRAGMA foreign_keys=OFF;');

  db.run(`CREATE TABLE IF NOT EXISTS produtividade_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador_id INTEGER NOT NULL,
    data DATE NOT NULL,
    contatados INTEGER DEFAULT 0,
    finalizados INTEGER DEFAULT 0,
    prontuario INTEGER DEFAULT 0,
    ganhos INTEGER DEFAULT 0,
    pendencias INTEGER DEFAULT 0,
    parcial INTEGER DEFAULT 1 CHECK (parcial BETWEEN 1 AND 6),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    retornaram INTEGER DEFAULT 0,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('CREATE TABLE ERROR', err.message);
      db.close();
      return;
    }

    db.run(`INSERT INTO produtividade_new (id, colaborador_id, data, contatados, finalizados, prontuario, ganhos, pendencias, parcial, created_at, updated_at, retornaram)
            SELECT id, colaborador_id, data, contatados, finalizados, prontuario, ganhos, pendencias, parcial, created_at, updated_at, retornaram FROM produtividade`, (err2) => {
      if (err2) {
        console.error('INSERT ERROR', err2.message);
        db.close();
        return;
      }

      db.run('DROP TABLE produtividade', (err3) => {
        if (err3) {
          console.error('DROP TABLE ERROR', err3.message);
          db.close();
          return;
        }

        db.run('ALTER TABLE produtividade_new RENAME TO produtividade', (err4) => {
          if (err4) {
            console.error('RENAME ERROR', err4.message);
          } else {
            console.log('SCHEMA UPDATED: parcial BETWEEN 1 AND 6 applied');
          }
          db.run('PRAGMA foreign_keys=ON;');
          db.close();
        });
      });
    });
  });
});
