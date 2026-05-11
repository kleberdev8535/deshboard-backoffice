const Produtividade = require('../models/Produtividade');
const { pool } = require('../database/connection');

// Controller para relatórios
class RelatoriosController {
  // Gerar relatório diário
  async relatorioDiario(req, res) {
    try {
      const { data } = req.query;
      const relatorio = await Produtividade.getRelatorioDiario(data);
      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Relatório de produtividade por colaborador
  async produtividadeColaborador(req, res) {
    try {
      const { data_inicio, data_fim, colaborador_id } = req.query;

      let query = `
        SELECT
          c.nome,
          p.data,
          p.contatados,
          p.retornaram,
          p.finalizados,
          p.prontuario,
          p.ganhos,
          p.pendencias,
          p.parcial
        FROM produtividade p
        JOIN colaboradores c ON p.colaborador_id = c.id
      `;
      const params = [];

      const conditions = [];
      if (data_inicio) {
        conditions.push('p.data >= ?');
        params.push(data_inicio);
      }
      if (data_fim) {
        conditions.push('p.data <= ?');
        params.push(data_fim);
      }
      if (colaborador_id) {
        conditions.push('p.colaborador_id = ?');
        params.push(colaborador_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY p.data DESC, c.nome';

      const [rows] = await pool.execute(query, params);

      // Agrupar por colaborador
      const relatorio = rows.reduce((acc, row) => {
        let colaborador = acc.find(c => c.nome === row.nome);
        if (!colaborador) {
          colaborador = {
            nome: row.nome,
            registros: [],
            totais: { contatados: 0, retornaram: 0, finalizados: 0, prontuario: 0, ganhos: 0, pendencias: 0 },
            _maxParcialPorDia: {}
          };
          acc.push(colaborador);
        }

        colaborador.registros.push({
          data: row.data,
          contatados: row.contatados,
          retornaram: row.retornaram,
          finalizados: row.finalizados,
          prontuario: row.prontuario,
          ganhos: row.ganhos,
          pendencias: row.pendencias,
          parcial: row.parcial
        });

        if (!colaborador._maxParcialPorDia[row.data] || row.parcial > colaborador._maxParcialPorDia[row.data].parcial) {
          if (colaborador._maxParcialPorDia[row.data]) {
            const prev = colaborador._maxParcialPorDia[row.data];
            colaborador.totais.contatados -= prev.contatados;
            colaborador.totais.retornaram -= (prev.retornaram || 0);
            colaborador.totais.finalizados -= prev.finalizados;
            colaborador.totais.prontuario -= prev.prontuario;
            colaborador.totais.ganhos -= prev.ganhos;
            colaborador.totais.pendencias -= prev.pendencias;
          }
          
          colaborador.totais.contatados += row.contatados;
          colaborador.totais.retornaram += (row.retornaram || 0);
          colaborador.totais.finalizados += row.finalizados;
          colaborador.totais.prontuario += row.prontuario;
          colaborador.totais.ganhos += row.ganhos;
          colaborador.totais.pendencias += row.pendencias;
          
          colaborador._maxParcialPorDia[row.data] = row;
        }

        return acc;
      }, []);

      relatorio.forEach(c => delete c._maxParcialPorDia);

      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Relatório de evolução temporal
  async evolucaoTemporal(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const startDate = data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = data_fim || new Date().toISOString().split('T')[0];

      const [rows] = await pool.execute(`
        SELECT
          p.data,
          SUM(p.contatados) as total_contatados,
          SUM(p.finalizados) as total_finalizados,
          SUM(p.prontuario) as total_prontuario,
          SUM(p.ganhos) as total_ganhos,
          SUM(p.pendencias) as total_pendencias,
          COUNT(DISTINCT p.colaborador_id) as colaboradores_ativos
        FROM produtividade p
        JOIN (
          SELECT data, colaborador_id, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data BETWEEN ? AND ?
          GROUP BY data, colaborador_id
        ) max_p ON p.data = max_p.data AND p.colaborador_id = max_p.colaborador_id AND p.parcial = max_p.max_parcial
        WHERE p.data BETWEEN ? AND ?
        GROUP BY p.data
        ORDER BY p.data
      `, [startDate, endDate, startDate, endDate]);

      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RelatoriosController();