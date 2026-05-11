const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./produtividade.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador TEXT NOT NULL,
    atividade TEXT NOT NULL,
    horas REAL NOT NULL,
    data TEXT NOT NULL
  )`);
});

module.exports = db;
