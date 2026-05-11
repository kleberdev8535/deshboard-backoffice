const Colaborador = require('../models/Colaborador');

// Controller para colaboradores
class ColaboradorController {
  // Listar todos os colaboradores
  async index(req, res) {
    try {
      const colaboradores = await Colaborador.findAll();
      res.json(colaboradores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mostrar colaborador específico
  async show(req, res) {
    try {
      const { id } = req.params;
      const colaborador = await Colaborador.findById(id);

      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      res.json(colaborador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar novo colaborador
  async store(req, res) {
    try {
      const { nome } = req.body;

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const colaborador = await Colaborador.create(nome.trim());
      res.status(201).json(colaborador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar colaborador
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const colaborador = await Colaborador.findById(id);
      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      const updatedColaborador = await Colaborador.update(id, nome.trim());
      res.json(updatedColaborador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar colaborador
  async delete(req, res) {
    try {
      const { id } = req.params;

      const colaborador = await Colaborador.findById(id);
      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      await Colaborador.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ColaboradorController();