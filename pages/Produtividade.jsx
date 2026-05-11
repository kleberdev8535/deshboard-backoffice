import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Produtividade = () => {
  const [registros, setRegistros] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);
  const [filterNome, setFilterNome] = useState('');
  const [filterParcial, setFilterParcial] = useState('');
  const [filterData, setFilterData] = useState('');

  // Função para obter a data local no formato YYYY-MM-DD
  const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    colaborador_id: '',
    data: '',
    contatados: '',
    finalizados: '',
    prontuario: '',
    ganhos: '',
    pendencias: '',
    parcial: '1'
  });

  const registrosFiltrados = registros.filter((registro) => {
    const passaNome = registro.colaborador_nome.toLowerCase().includes(filterNome.toLowerCase());
    const passaParcial = filterParcial === '' || registro.parcial.toString() === filterParcial;
    const registroDataFormatada = registro.data.includes('T') ? registro.data.split('T')[0] : registro.data;
    const passaData = filterData === '' || registroDataFormatada === filterData;
    return passaNome && passaParcial && passaData;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [registrosRes, colaboradoresRes] = await Promise.all([
        axios.get('/api/produtividade'),
        axios.get('/api/colaboradores')
      ]);
      setRegistros(registrosRes.data);
      setColaboradores(colaboradoresRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRegistro) {
        await axios.put(`/api/produtividade/${editingRegistro.id}`, formData);
      } else {
        await axios.post('/api/produtividade', formData);
      }

      // Salvar timestamp da última modificação
      localStorage.setItem('produtividade_last_save', new Date().toISOString());

      loadData();
      setModalOpen(false);
      setEditingRegistro(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      data: getLocalDate(),
      contatados: '',
      retornaram: '',
      finalizados: '',
      prontuario: '',
      ganhos: '',
      pendencias: '',
      parcial: '1'
    });
  };

  const handleEdit = (registro) => {
    setEditingRegistro(registro);
    setFormData({
      colaborador_id: registro.colaborador_id,
      data: registro.data,
      contatados: registro.contatados,
      retornaram: registro.retornaram,
      finalizados: registro.finalizados,
      prontuario: registro.prontuario,
      ganhos: registro.ganhos,
      pendencias: registro.pendencias,
      parcial: registro.parcial
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await axios.delete(`/api/produtividade/${id}`);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
      }
    }
  };

  const openModal = () => {
    setEditingRegistro(null);
    resetForm();
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
            Registro de Produtividade
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Registre a produtividade diária da equipe
          </p>
        </div>
        <Button onClick={openModal} className="flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>Novo Registro</span>
        </Button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por nome
            </label>
            <input
              type="text"
              placeholder="Digite o nome do colaborador..."
              value={filterNome}
              onChange={(e) => setFilterNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por data
            </label>
            <input
              type="date"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por parcial
            </label>
            <select
              value={filterParcial}
              onChange={(e) => setFilterParcial(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todas as parciais</option>
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
              <option value="4">Parcial 4</option>
              <option value="5">Parcial 5</option>
              <option value="6">Encerramento Diário</option>
            </select>
          </div>

          {(filterNome || filterParcial || filterData) && (
            <button
              onClick={() => {
                setFilterNome('');
                setFilterParcial('');
                setFilterData('');
              }}
              className="flex items-center space-x-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
        {registrosFiltrados.length !== registros.length && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {registrosFiltrados.length} de {registros.length} registros
          </div>
        )}
      </div>

      {/* Tabela de registros */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Colaborador</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Data</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Contatados</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Retornaram</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Finalizados</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Prontuário</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Ganhos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Pendências</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Parcial</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((registro) => (
                <tr key={registro.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{registro.colaborador_nome}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(registro.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.contatados}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.retornaram || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.finalizados}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.prontuario}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.ganhos}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{registro.pendencias}</td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {Number(registro.parcial) === 6 ? 'Encerramento Diário' : registro.parcial}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(registro)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(registro.id)}
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

        {registrosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {registros.length === 0 ? 'Nenhum registro encontrado' : 'Nenhum registro corresponde aos filtros'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRegistro ? 'Editar Registro' : 'Novo Registro'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colaborador
              </label>
              <select
                value={formData.colaborador_id}
                onChange={(e) => setFormData({ ...formData, colaborador_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.parcial === '6' && (
              <>
                <Input
                  label="Contatados"
                  type="number"
                  value={formData.contatados}
                  onChange={(e) => setFormData({ ...formData, contatados: e.target.value })}
                  min="0"
                />
                <Input
                  label="Retornaram"
                  type="number"
                  value={formData.retornaram || ''}
                  onChange={(e) => setFormData({ ...formData, retornaram: e.target.value })}
                  min="0"
                />
                <Input
                  label="Pendências"
                  type="number"
                  value={formData.pendencias}
                  onChange={(e) => setFormData({ ...formData, pendencias: e.target.value })}
                  min="0"
                />
              </>
            )}
            <Input
              label="Finalizados"
              type="number"
              value={formData.finalizados}
              onChange={(e) => setFormData({ ...formData, finalizados: e.target.value })}
              min="0"
            />
            <Input
              label="Prontuário"
              type="number"
              value={formData.prontuario}
              onChange={(e) => setFormData({ ...formData, prontuario: e.target.value })}
              min="0"
            />
            <Input
              label="Ganhos"
              type="number"
              value={formData.ganhos}
              onChange={(e) => setFormData({ ...formData, ganhos: e.target.value })}
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parcial
              </label>
              <select
                value={formData.parcial}
                onChange={(e) => {
                  const newParcial = e.target.value;
                  setFormData({
                    ...formData,
                    parcial: newParcial,
                    contatados: newParcial === '6' ? formData.contatados : '',
                    retornaram: newParcial === '6' ? formData.retornaram : '',
                    pendencias: newParcial === '6' ? formData.pendencias : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>Parcial {num}</option>
                ))}
                <option value="6">Encerramento Diário</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingRegistro ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Produtividade;