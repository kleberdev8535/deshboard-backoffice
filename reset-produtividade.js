const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./produtividade.db', (err) => {
  if (err) {
    console.error('Erro ao conectar no DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run('DELETE FROM produtividade', function(err) {
    if (err) {
      console.error('Erro ao limpar produtividade:', err.message);
      process.exit(1);
    }
    console.log(`Linhas removidas de produtividade: ${this.changes}`);
  });
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar DB:', err.message);
  } else {
    console.log('Banco de dados atualizado com sucesso.');
  }
});
