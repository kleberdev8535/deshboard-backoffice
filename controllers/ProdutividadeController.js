const Produtividade = require('../models/Produtividade');

// Controller para produtividade
class ProdutividadeController {
  // Listar registros de produtividade
  async index(req, res) {
    try {
      const { data, colaborador_id } = req.query;
      const filters = {};

      if (data) filters.data = data;
      if (colaborador_id) filters.colaborador_id = parseInt(colaborador_id);

      const registros = await Produtividade.findAll(filters);
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mostrar registro específico
  async show(req, res) {
    try {
      const { id } = req.params;
      const registro = await Produtividade.findById(id);

      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar novo registro
  async store(req, res) {
    try {
      const { colaborador_id, data, contatados, retornaram, finalizados, prontuario, ganhos, pendencias, parcial } = req.body;

      // Validações
      if (!colaborador_id || !data) {
        return res.status(400).json({ error: 'Colaborador e data são obrigatórios' });
      }

      if (parcial && (parcial < 1 || parcial > 6)) {
        return res.status(400).json({ error: 'Parcial deve estar entre 1 e 6' });
      }

      const registro = await Produtividade.create({
        colaborador_id,
        data,
        contatados: contatados || 0,
        retornaram: retornaram || 0,
        finalizados: finalizados || 0,
        prontuario: prontuario || 0,
        ganhos: ganhos || 0,
        pendencias: pendencias || 0,
        parcial: parcial || 1
      });

      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar registro
  async update(req, res) {
    try {
      const { id } = req.params;
      const { contatados, retornaram, finalizados, prontuario, ganhos, pendencias, parcial } = req.body;

      const registro = await Produtividade.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      if (parcial && (parcial < 1 || parcial > 6)) {
        return res.status(400).json({ error: 'Parcial deve estar entre 1 e 6' });
      }

      const updatedRegistro = await Produtividade.update(id, {
        contatados: contatados || 0,
        finalizados: finalizados || 0,
        prontuario: prontuario || 0,
        ganhos: ganhos || 0,
        pendencias: pendencias || 0,
        parcial: parcial || 1
      });

      res.json(updatedRegistro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar registro
  async delete(req, res) {
    try {
      const { id } = req.params;

      const registro = await Produtividade.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      await Produtividade.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProdutividadeController();