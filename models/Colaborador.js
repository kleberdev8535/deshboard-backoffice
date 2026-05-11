const { pool } = require('../database/connection');

class Colaborador {
  // Buscar todos os colaboradores
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM colaboradores ORDER BY nome');
      return rows;
    } catch (error) {
      throw new Error('Erro ao buscar colaboradores: ' + error.message);
    }
  }

  // Buscar colaborador por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM colaboradores WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Erro ao buscar colaborador: ' + error.message);
    }
  }

  // Criar novo colaborador
  static async create(nome) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO colaboradores (nome) VALUES (?)',
        [nome]
      );
      return { id: result.insertId, nome };
    } catch (error) {
      throw new Error('Erro ao criar colaborador: ' + error.message);
    }
  }

  // Atualizar colaborador
  static async update(id, nome) {
    try {
      await pool.execute(
        'UPDATE colaboradores SET nome = ? WHERE id = ?',
        [nome, id]
      );
      return { id, nome };
    } catch (error) {
      throw new Error('Erro ao atualizar colaborador: ' + error.message);
    }
  }

  // Deletar colaborador
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM colaboradores WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error('Erro ao deletar colaborador: ' + error.message);
    }
  }
}

module.exports = Colaborador;