import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MetricCard from '../components/dashboard/MetricCard';
import ProgressCard from '../components/dashboard/ProgressCard';
import ChartCard from '../components/dashboard/ChartCard';
import ParciaisCard from '../components/dashboard/ParciaisCard';
import { FiTarget, FiCheckCircle, FiUsers, FiTrendingUp, FiPhone, FiPercent, FiRefreshCw, FiEdit2, FiMessageCircle } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [parciais, setParciais] = useState([]);
  const [graficos, setGraficos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showUpdateHint, setShowUpdateHint] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaInput, setMetaInput] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const loadDashboardData = useCallback(async () => {
    console.log('🔄 Carregando dados do dashboard...');
    setLoading(true);
    try {
      const [statsRes, parciaisRes, graficosRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/parciais'),
        axios.get('/api/dashboard/graficos')
      ]);

      console.log('✅ Dados recebidos:', statsRes.data.totalFinalizados, 'finalizados');
      setStats(statsRes.data);
      setMetaInput(String(statsRes.data.metaDia || 15));
      setParciais(parciaisRes.data);
      setGraficos(graficosRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMetaDia = async () => {
    const parsedMeta = Number(metaInput);

    if (!parsedMeta || parsedMeta <= 0) {
      return alert('Informe uma meta válida maior que zero.');
    }

    try {
      setSavingMeta(true);
      const response = await axios.put('/api/dashboard/meta', { metaDia: parsedMeta });
      setStats(response.data);
      setEditingMeta(false);
      setLastUpdate(new Date());
      alert('Meta do dia atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar meta do dia:', error);
      alert('Não foi possível atualizar a meta. Tente novamente.');
    } finally {
      setSavingMeta(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Verificar se dados foram salvos recentemente
    const lastSave = localStorage.getItem('produtividade_last_save');
    if (lastSave) {
      const saveTime = new Date(lastSave);
      const now = new Date();
      const diffMinutes = (now - saveTime) / (1000 * 60);
      if (diffMinutes < 5) {
        setShowUpdateHint(true);
        setTimeout(() => setShowUpdateHint(false), 10000);
      }
    }

    // Recarregar quando a página ganha foco
    const handleFocus = () => loadDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Produtividade
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Acompanhe o desempenho da equipe em tempo real
          </p>
          <div className="mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              A coordenadora pode editar a meta diretamente no cartão "Meta do Dia".
            </span>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
          {showUpdateHint && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Dados podem ter sido atualizados. Clique em "Atualizar" para ver as últimas informações.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            console.log('🔄 Botão atualizar clicado');
            loadDashboardData();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Meta do Dia"
          value={stats?.metaDia || 0}
          icon={FiTarget}
          color="blue"
          action={
            <button
              onClick={() => setEditingMeta(true)}
              className="inline-flex items-center justify-center rounded-full bg-primary-100 p-2 text-primary-700 hover:bg-primary-200"
              aria-label="Editar meta do dia"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          }
        >
          {editingMeta && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="1"
                value={metaInput}
                onChange={(e) => setMetaInput(e.target.value)}
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={saveMetaDia}
                disabled={savingMeta}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {savingMeta ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setEditingMeta(false);
                  setMetaInput(String(stats?.metaDia || 15));
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </MetricCard>
        <MetricCard
          title="Finalizados"
          value={stats?.totalFinalizados || 0}
          icon={FiCheckCircle}
          color="green"
        />
        <MetricCard
          title="Em Prontuário"
          value={stats?.totalProntuario || 0}
          icon={FiUsers}
          color="purple"
        />
        <MetricCard
          title="Ganhos"
          value={stats?.totalGanhos || 0}
          icon={FiTrendingUp}
          color="yellow"
        />
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Pendências"
          value={stats?.totalPendencias || 0}
          icon={FiPhone}
          color="red"
        />
        <MetricCard
          title="Total Contatados"
          value={stats?.totalContatados || 0}
          icon={FiPhone}
          color="indigo"
        />
        <MetricCard
          title="Total Retornaram"
          value={stats?.totalRetornaram || 0}
          icon={FiMessageCircle}
          color="blue"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${stats?.taxaConversao || 0}%`}
          icon={FiPercent}
          color="teal"
        />
      </div>

      {/* Progresso da meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard
          title="Progresso da Meta"
          current={stats?.totalFinalizados || 0}
          target={stats?.metaDia || 15}
          percentage={stats?.progressoMeta || 0}
        />
        <ParciaisCard parciais={parciais} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Produtividade por Colaborador"
          type="bar"
          data={graficos?.produtividadeColaborador || []}
          dataKey="finalizados"
          xAxisKey="nome"
        />
        <ChartCard
          title="Distribuição de Status"
          type="pie"
          data={graficos?.distribuicaoStatus || []}
        />
      </div>

      {/* Gráfico de evolução */}
      <ChartCard
        title="Evolução Diária (Últimos 7 dias)"
        type="line"
        data={graficos?.evolucaoDiaria || []}
        dataKey="finalizados"
        xAxisKey="data"
        fullWidth
      />
    </div>
  );
};

export default Dashboard;