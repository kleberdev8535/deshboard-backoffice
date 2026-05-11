const { pool } = require('../database/connection');

class Produtividade {
  // Buscar todos os registros de produtividade
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, c.nome as colaborador_nome
        FROM produtividade p
        JOIN colaboradores c ON p.colaborador_id = c.id
      `;
      const params = [];

      if (filters.data) {
        query += ' WHERE p.data = ?';
        params.push(filters.data);
      }

      if (filters.colaborador_id) {
        query += filters.data ? ' AND' : ' WHERE';
        query += ' p.colaborador_id = ?';
        params.push(filters.colaborador_id);
      }

      query += ' ORDER BY p.data DESC, c.nome';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error('Erro ao buscar produtividade: ' + error.message);
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, c.nome as colaborador_nome
        FROM produtividade p
        JOIN colaboradores c ON p.colaborador_id = c.id
        WHERE p.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Erro ao buscar registro de produtividade: ' + error.message);
    }
  }

  // Criar novo registro
  static async create(data) {
    try {
      const { colaborador_id, data: dataRegistro, contatados, retornaram, finalizados, prontuario, ganhos, pendencias, parcial } = data;
      const [result] = await pool.execute(
        `INSERT INTO produtividade
         (colaborador_id, data, contatados, retornaram, finalizados, prontuario, ganhos, pendencias, parcial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [colaborador_id, dataRegistro, contatados || 0, retornaram || 0, finalizados || 0, prontuario || 0, ganhos || 0, pendencias || 0, parcial || 1]
      );
      return { id: result.insertId, ...data };
    } catch (error) {
      throw new Error('Erro ao criar registro de produtividade: ' + error.message);
    }
  }

  // Atualizar registro
  static async update(id, data) {
    try {
      const { contatados, retornaram, finalizados, prontuario, ganhos, pendencias, parcial } = data;
      await pool.execute(
        `UPDATE produtividade SET
         contatados = ?, retornaram = ?, finalizados = ?, prontuario = ?, ganhos = ?, pendencias = ?, parcial = ?
         WHERE id = ?`,
        [contatados || 0, retornaram || 0, finalizados || 0, prontuario || 0, ganhos || 0, pendencias || 0, parcial || 1, id]
      );
      return { id, ...data };
    } catch (error) {
      throw new Error('Erro ao atualizar registro de produtividade: ' + error.message);
    }
  }

  // Deletar registro
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM produtividade WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error('Erro ao deletar registro de produtividade: ' + error.message);
    }
  }

  // Buscar meta do dia configurada
  static async getMetaDia() {
    try {
      const [rows] = await pool.execute(`SELECT value FROM config WHERE key = ?`, ['metaDia']);
      const row = rows[0];
      return row ? parseInt(row.value, 10) : 15;
    } catch (error) {
      throw new Error('Erro ao buscar meta do dia: ' + error.message);
    }
  }

  // Atualizar valor da meta do dia
  static async setMetaDia(metaDia) {
    try {
      await pool.execute(
        `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`,
        ['metaDia', String(metaDia)]
      );
      return metaDia;
    } catch (error) {
      throw new Error('Erro ao atualizar meta do dia: ' + error.message);
    }
  }

  // Buscar estatísticas do dashboard
  static async getDashboardStats(data = null) {
    try {
      const getLocalDateStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      const targetDate = data || getLocalDateStr();
      const [rows] = await pool.execute(`
        SELECT
          SUM(p.contatados) as total_contatados,
          SUM(p.retornaram) as total_retornaram,
          SUM(p.finalizados) as total_finalizados,
          SUM(p.prontuario) as total_prontuario,
          SUM(p.ganhos) as total_ganhos,
          SUM(p.pendencias) as total_pendencias,
          COUNT(DISTINCT p.colaborador_id) as total_colaboradores
        FROM produtividade p
        JOIN (
          SELECT colaborador_id, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data = ?
          GROUP BY colaborador_id
        ) max_p ON p.colaborador_id = max_p.colaborador_id AND p.parcial = max_p.max_parcial
        WHERE p.data = ?
      `, [targetDate, targetDate]);

      const stats = rows[0];
      const metaDia = await this.getMetaDia();
      const taxaConversao = stats.total_contatados > 0 ? (stats.total_retornaram / stats.total_contatados * 100).toFixed(2) : 0;
      const progressoMeta = ((stats.total_finalizados / metaDia) * 100).toFixed(2);

      return {
        metaDia,
        totalFinalizados: stats.total_finalizados || 0,
        totalProntuario: stats.total_prontuario || 0,
        totalGanhos: stats.total_ganhos || 0,
        totalPendencias: stats.total_pendencias || 0,
        totalContatados: stats.total_contatados || 0,
        totalRetornaram: stats.total_retornaram || 0,
        taxaConversao: parseFloat(taxaConversao),
        progressoMeta: parseFloat(progressoMeta)
      };
    } catch (error) {
      throw new Error('Erro ao buscar estatísticas do dashboard: ' + error.message);
    }
  }

  // Buscar dados das parciais
  static async getParciais(data = null) {
    try {
      const getLocalDateStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      const targetDate = data || getLocalDateStr();
      const [rows] = await pool.execute(`
        SELECT parcial, SUM(finalizados) as total_finalizados
        FROM produtividade
        WHERE data = ?
        GROUP BY parcial
        ORDER BY parcial
      `, [targetDate]);

      const parciais = [];
      for (let i = 1; i <= 5; i++) {
        const parcial = rows.find(r => r.parcial === i) || { parcial: i, total_finalizados: 0 };
        const metaParcial = 3;
        const progresso = ((parcial.total_finalizados / metaParcial) * 100).toFixed(2);
        const status = parcial.total_finalizados >= metaParcial ? 'concluida' : 'em_andamento';

        parciais.push({
          numero: i,
          meta: metaParcial,
          atual: parcial.total_finalizados,
          progresso: parseFloat(progresso),
          status
        });
      }

      return parciais;
    } catch (error) {
      throw new Error('Erro ao buscar dados das parciais: ' + error.message);
    }
  }

  // Buscar relatório diário
  static async getRelatorioDiario(data = null) {
    try {
      const getLocalDateStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      const targetDate = data || getLocalDateStr();
      const [stats] = await pool.execute(`
        SELECT
          SUM(p.contatados) as total_contatados,
          SUM(p.retornaram) as total_retornaram,
          SUM(p.finalizados) as total_finalizados,
          SUM(p.prontuario) as total_prontuario,
          SUM(p.ganhos) as total_ganhos,
          SUM(p.pendencias) as total_pendencias
        FROM produtividade p
        JOIN (
          SELECT colaborador_id, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data = ?
          GROUP BY colaborador_id
        ) max_p ON p.colaborador_id = max_p.colaborador_id AND p.parcial = max_p.max_parcial
        WHERE p.data = ?
      `, [targetDate, targetDate]);

      const [colaboradorDestaque] = await pool.execute(`
        SELECT c.nome, SUM(p.finalizados) as total_finalizados
        FROM produtividade p
        JOIN colaboradores c ON p.colaborador_id = c.id
        WHERE p.data = ?
        GROUP BY p.colaborador_id
        ORDER BY total_finalizados DESC
        LIMIT 1
      `, [targetDate]);

      const metaDia = await this.getMetaDia();
      const percentualMeta = stats[0].total_finalizados > 0 ? ((stats[0].total_finalizados / metaDia) * 100).toFixed(2) : 0;

      const parciais = await this.getParciais(targetDate);
      const totalParciais = parciais.filter(p => p.status === 'concluida').length;

      return {
        data: targetDate,
        totalContatados: stats[0].total_contatados || 0,
        totalRetornaram: stats[0].total_retornaram || 0,
        totalFinalizados: stats[0].total_finalizados || 0,
        totalProntuario: stats[0].total_prontuario || 0,
        totalGanhos: stats[0].total_ganhos || 0,
        totalPendencias: stats[0].total_pendencias || 0,
        colaboradorDestaque: colaboradorDestaque[0]?.nome || 'Nenhum',
        percentualMeta: parseFloat(percentualMeta),
        totalParciais
      };
    } catch (error) {
      throw new Error('Erro ao gerar relatório diário: ' + error.message);
    }
  }
}

module.exports = Produtividade;