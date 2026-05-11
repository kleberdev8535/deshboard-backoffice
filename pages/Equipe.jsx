import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Equipe = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState(null);
  const [formData, setFormData] = useState({ nome: '' });

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      const response = await axios.get('/api/colaboradores');
      setColaboradores(response.data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingColaborador) {
        await axios.put(`/api/colaboradores/${editingColaborador.id}`, formData);
      } else {
        await axios.post('/api/colaboradores', formData);
      }

      loadColaboradores();
      setModalOpen(false);
      setEditingColaborador(null);
      setFormData({ nome: '' });
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
    }
  };

  const handleEdit = (colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({ nome: colaborador.nome });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await axios.delete(`/api/colaboradores/${id}`);
        loadColaboradores();
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
      }
    }
  };

  const openModal = () => {
    setEditingColaborador(null);
    setFormData({ nome: '' });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão da Equipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie os colaboradores da equipe
          </p>
        </div>
        <Button onClick={openModal} className="flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>Adicionar Colaborador</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{colaboradores.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de colaboradores */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Data de Cadastro</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{colaborador.nome}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(colaborador.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(colaborador)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(colaborador.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {colaboradores.length === 0 && (
          <div className="text-center py-8">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum colaborador cadastrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingColaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Colaborador"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Digite o nome completo"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingColaborador ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipe;