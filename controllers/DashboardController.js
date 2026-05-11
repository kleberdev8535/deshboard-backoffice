const Produtividade = require('../models/Produtividade');
const { pool } = require('../database/connection');

// Controller para dashboard
class DashboardController {
  // Buscar estatísticas do dashboard
  async getStats(req, res) {
    try {
      const { data } = req.query;
      const stats = await Produtividade.getDashboardStats(data);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar dados das parciais
  async getParciais(req, res) {
    try {
      const { data } = req.query;
      const parciais = await Produtividade.getParciais(data);
      res.json(parciais);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar dados para gráficos
  async getGraficos(req, res) {
    try {
      const { data, periodo = 7 } = req.query; // período em dias
      const getLocalDateStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      const targetDate = data || getLocalDateStr();

      // Dados para gráfico de barras (produtividade por colaborador)
      const [produtividadeColaborador] = await pool.execute(`
        SELECT c.nome, p.finalizados, p.ganhos
        FROM produtividade p
        JOIN colaboradores c ON p.colaborador_id = c.id
        JOIN (
          SELECT colaborador_id, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data = ?
          GROUP BY colaborador_id
        ) max_p ON p.colaborador_id = max_p.colaborador_id AND p.parcial = max_p.max_parcial
        WHERE p.data = ?
        ORDER BY p.finalizados DESC
      `, [targetDate, targetDate]);

      // Dados para gráfico de linha (evolução diária)
      const endDate = new Date(targetDate);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - parseInt(periodo));

      const startDateStr = startDate.toISOString().split('T')[0];
      const [evolucaoDiaria] = await pool.execute(`
        SELECT p.data, SUM(p.finalizados) as finalizados, SUM(p.ganhos) as ganhos
        FROM produtividade p
        JOIN (
          SELECT colaborador_id, data, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data BETWEEN ? AND ?
          GROUP BY colaborador_id, data
        ) max_p ON p.colaborador_id = max_p.colaborador_id AND p.data = max_p.data AND p.parcial = max_p.max_parcial
        WHERE p.data BETWEEN ? AND ?
        GROUP BY p.data
        ORDER BY p.data
      `, [startDateStr, targetDate, startDateStr, targetDate]);

      // Dados para gráfico de pizza (distribuição de status)
      const [distribuicaoStatus] = await pool.execute(`
        SELECT
          SUM(p.finalizados) as finalizados,
          SUM(p.prontuario) as prontuario,
          SUM(p.ganhos) as ganhos,
          SUM(p.pendencias) as pendencias
        FROM produtividade p
        JOIN (
          SELECT colaborador_id, MAX(parcial) as max_parcial
          FROM produtividade
          WHERE data = ?
          GROUP BY colaborador_id
        ) max_p ON p.colaborador_id = max_p.colaborador_id AND p.parcial = max_p.max_parcial
        WHERE p.data = ?
      `, [targetDate, targetDate]);

      const statusData = distribuicaoStatus[0];
      const pizzaData = [
        { name: 'Finalizados', value: statusData.finalizados || 0 },
        { name: 'Prontuário', value: statusData.prontuario || 0 },
        { name: 'Ganhos', value: statusData.ganhos || 0 },
        { name: 'Pendências', value: statusData.pendencias || 0 }
      ];

      res.json({
        produtividadeColaborador,
        evolucaoDiaria,
        distribuicaoStatus: pizzaData
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar a meta do dia
  async updateMeta(req, res) {
    try {
      const { metaDia } = req.body;
      const parsedMeta = Number(metaDia);

      if (!parsedMeta || parsedMeta <= 0) {
        return res.status(400).json({ error: 'Meta do dia deve ser um número maior que zero.' });
      }

      await Produtividade.setMetaDia(parsedMeta);
      const stats = await Produtividade.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();