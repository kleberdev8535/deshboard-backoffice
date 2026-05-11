const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Criar conexão SQLite
const db = new sqlite3.Database('./produtividade.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('✅ Conexão com SQLite estabelecida com sucesso!');
    db.run(`CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )`, (createErr) => {
      if (createErr) {
        console.error('❌ Erro ao criar tabela de configuração:', createErr.message);
      }
    });
  }
});

// Wrapper para manter compatibilidade com o código MySQL
const pool = {
  execute: (query, params = []) => {
    return new Promise((resolve, reject) => {
      // Para queries SELECT
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve([rows]);
          }
        });
      }
      // Para queries INSERT, UPDATE, DELETE
      else {
        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            // Para INSERT, retorna o ID inserido
            if (query.trim().toUpperCase().startsWith('INSERT')) {
              resolve([{ insertId: this.lastID }]);
            } else {
              resolve([{ affectedRows: this.changes }]);
            }
          }
        });
      }
    });
  },
  getConnection: () => Promise.resolve({ release: () => {} })
};

const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  pool,
  testConnection,
  db
};