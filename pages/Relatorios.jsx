import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ChartCard from '../components/dashboard/ChartCard';

const formatDateBR = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const Relatorios = () => {
  // Função para obter a data local no formato YYYY-MM-DD
  const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [relatorioDiario, setRelatorioDiario] = useState(null);
  const [relatoriosColaborador, setRelatoriosColaborador] = useState([]);
  const [evolucaoTemporal, setEvolucaoTemporal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(getLocalDate());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadRelatorios();
  }, [dataFiltro]);

  const loadRelatorios = async () => {
    try {
      const [diarioRes, colaboradorRes, evolucaoRes] = await Promise.all([
        axios.get(`/api/relatorios/diario?data=${dataFiltro}`),
        axios.get(`/api/relatorios/produtividade-colaborador?data_inicio=${dataFiltro}&data_fim=${dataFiltro}`),
        axios.get(`/api/relatorios/evolucao-temporal?data_inicio=${dataFiltro}&data_fim=${dataFiltro}`)
      ]);

      setRelatorioDiario(diarioRes.data);
      setRelatoriosColaborador(colaboradorRes.data);
      setEvolucaoTemporal(evolucaoRes.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };



  const getSugestoes = () => {
    if (!relatorioDiario) return [];

    const sugestoes = [];
    const usedKeys = new Set();
    const taxaConversao = relatorioDiario.totalContatados
      ? (relatorioDiario.totalRetornaram || 0) / relatorioDiario.totalContatados
      : 0;
      
    const taxaFechamento = (relatorioDiario.totalRetornaram || 0) > 0
      ? relatorioDiario.totalFinalizados / (relatorioDiario.totalRetornaram || 1)
      : 0;

    const allTexts = {
      conversaoInicial: 'Otimização da Conversão Inicial (Primeiro Contato): A taxa de retorno inicial dos leads encontra-se abaixo da meta esperada, indicando necessidade de ajustes na abordagem comercial. Reavalie o roteiro utilizado nas primeiras interações, priorizando perguntas estratégicas e personalizadas para gerar maior engajamento logo nos primeiros minutos da conversa. Trabalhe gatilhos de interesse, empatia e urgência para aumentar as chances de continuidade no atendimento.',
      followUp: 'Fortalecimento do Processo de Follow-up: Observa-se um volume elevado de clientes em situação de retorno ou pendência. Recomenda-se a criação de uma rotina específica para retomada desses contatos, com foco em clientes que demonstraram interesse, mas não avançaram no fechamento. A consistência no follow-up pode reduzir perdas de oportunidade e melhorar significativamente a conversão final da carteira.',
      prontuarios: 'Acompanhamento Estratégico de Prontuários em Análise: Existe uma quantidade considerável de processos aguardando análise/prontuário. É fundamental monitorar diariamente essas demandas junto aos setores responsáveis para evitar atrasos e esfriamento das negociações. Manter o cliente atualizado durante essa etapa contribui diretamente para retenção e confiança no atendimento.',
      comunicacao: 'Melhoria na Qualidade da Comunicação Comercial: O desempenho atual demonstra necessidade de aprimoramento na condução das conversas com os leads. Busque tornar o atendimento mais consultivo e menos automático, criando conexões mais naturais com o cliente. Utilize uma comunicação clara, objetiva e direcionada às necessidades apresentadas durante o contato.',
      leadsParados: 'Redução de Leads Parados no Fluxo Operacional: Foi identificado um número expressivo de clientes sem movimentação recente no funil. Recomenda-se realizar uma força-tarefa focada na atualização dessas tratativas, revisando status, retornos pendentes e oportunidades de reativação. A limpeza do fluxo operacional melhora a organização e aumenta a produtividade da equipe.',
      eficiencia: 'Aumento de Eficiência na Etapa de Conversão: A taxa de evolução entre contato inicial e fechamento apresenta margem para crescimento. Avalie os principais pontos de perda durante o atendimento e trabalhe estratégias para contornar objeções com maior segurança. Uma condução mais estratégica tende a elevar o aproveitamento dos leads recebidos.',
      demandas: 'Organização e Priorização de Demandas Pendentes: Há indícios de acúmulo de atendimentos aguardando continuidade. Defina prioridades com base no potencial de fechamento e tempo sem retorno, garantindo que clientes mais avançados no processo recebam acompanhamento constante. A organização adequada reduz gargalos e evita perda de oportunidades comerciais.',
      monitoramento: 'Monitoramento Ativo de Clientes em Processo Interno: Clientes atualmente em análise ou aguardando documentação exigem acompanhamento próximo para evitar desinteresse ao longo da jornada. Mantenha contato frequente, demonstrando andamento do processo e reforçando o suporte prestado pela equipe durante todas as etapas da negociação.',
      reativacao: 'Desenvolvimento de Estratégias para Reativação de Leads: Parte significativa da carteira demonstra baixa interação após o primeiro contato. Considere implementar abordagens diferenciadas para reengajamento, utilizando mensagens mais personalizadas, reforço de benefícios e senso de oportunidade. Pequenos ajustes no retorno podem gerar impacto positivo nos resultados.',
      performance: 'Aprimoramento Geral da Performance Operacional: Os indicadores atuais mostram oportunidades claras de evolução tanto na conversão quanto na gestão do fluxo de clientes. O foco deve estar em melhorar a qualidade do atendimento, aumentar a frequência dos acompanhamentos e reduzir o tempo de resposta entre as etapas do processo. Uma operação mais organizada tende a gerar maior produtividade e melhores resultados diários.'
    };

    const addSugestao = (key) => {
      if (!usedKeys.has(key)) {
        sugestoes.push(allTexts[key]);
        usedKeys.add(key);
      }
    };

    // Regras de negócio precisas para o momento
    if (taxaConversao < 0.4 && relatorioDiario.totalContatados >= 10) addSugestao('conversaoInicial');
    if (taxaFechamento < 0.3) addSugestao('comunicacao');
    if (relatorioDiario.totalPendencias > 15) addSugestao('leadsParados');
    else if (relatorioDiario.totalPendencias > 5) addSugestao('demandas');
    else if (relatorioDiario.totalPendencias > 0) addSugestao('followUp');
    
    if (relatorioDiario.totalProntuario > 10) addSugestao('monitoramento');
    else if (relatorioDiario.totalProntuario > 0) addSugestao('prontuarios');
    
    if (relatorioDiario.percentualMeta < 50) addSugestao('performance');
    if (taxaFechamento >= 0.3 && taxaFechamento < 0.6) addSugestao('eficiencia');
    if (taxaConversao >= 0.4 && taxaConversao < 0.6) addSugestao('reativacao');

    // Preencher espaço vazio com conselhos gerais até ter 5 textos na página
    const fallbackKeys = ['performance', 'reativacao', 'comunicacao', 'eficiencia', 'demandas', 'followUp', 'conversaoInicial', 'prontuarios', 'monitoramento', 'leadsParados'];
    for (const key of fallbackKeys) {
      if (sugestoes.length >= 5) break;
      addSugestao(key);
    }

    return sugestoes;
  };

  const exportarPDF = async () => {
    if (!relatorioDiario) return;

    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      
      // Header Banner
      doc.setFillColor(59, 130, 246); // Tailwind blue-500
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Produtividade', 40, 45);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data Base: ${formatDateBR(relatorioDiario.data)}`, 40, 65);

      // Metrics grid
      doc.setTextColor(0, 0, 0);
      let currentY = 110;
      const convRate = relatorioDiario.totalContatados > 0 ? (((relatorioDiario.totalRetornaram || 0) / relatorioDiario.totalContatados) * 100).toFixed(1) : 0;
      
      const metrics = [
        { label: 'Leads Contatados:', value: relatorioDiario.totalContatados || 0 },
        { label: 'Retornaram:', value: relatorioDiario.totalRetornaram || 0 },
        { label: 'Finalizados:', value: relatorioDiario.totalFinalizados || 0 },
        { label: 'Em Prontuário:', value: relatorioDiario.totalProntuario || 0 },
        { label: 'Ganhos:', value: relatorioDiario.totalGanhos || 0 },
        { label: 'Pendências:', value: relatorioDiario.totalPendencias || 0 },
        { label: 'Taxa de Conversão:', value: `${convRate}%` }
      ];

      doc.setFontSize(12);
      metrics.forEach((m, i) => {
        const isLeftCol = i % 2 === 0;
        const xPos = isLeftCol ? 40 : 320;
        if (isLeftCol && i > 0) currentY += 25;

        doc.setFont('helvetica', 'bold');
        doc.text(m.label, xPos, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(String(m.value), xPos + 140, currentY);
      });

      currentY += 50;

      // Sugestões section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Análise e Sugestões Estratégicas', 40, currentY);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(40, currentY + 10, doc.internal.pageSize.getWidth() - 40, currentY + 10);
      
      currentY += 35;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      
      const sugestoes = getSugestoes();
      sugestoes.forEach((sugestao) => {
        if (currentY > doc.internal.pageSize.getHeight() - 80) {
          doc.addPage();
          currentY = 60;
        }

        const parts = sugestao.split(':');
        const title = parts[0] ? parts[0] + ':' : '';
        const body = parts.slice(1).join(':').trim();

        if (title && body) {
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${title}`, 40, currentY);
          currentY += 16;
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(body, doc.internal.pageSize.getWidth() - 80);
          doc.text(lines, 60, currentY); // indent body
          currentY += lines.length * 14 + 15;
        } else {
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(`• ${sugestao}`, doc.internal.pageSize.getWidth() - 80);
          doc.text(lines, 40, currentY);
          currentY += lines.length * 14 + 15;
        }
      });

      // Reset colors for the next page
      doc.setTextColor(0, 0, 0);

      const colaboradorRows = relatoriosColaborador.map((colaborador) => [
        colaborador.nome,
        colaborador.totais.contatados,
        colaborador.totais.retornaram || 0,
        colaborador.totais.finalizados,
        colaborador.totais.prontuario,
        colaborador.totais.ganhos,
        colaborador.totais.pendencias
      ]);

      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Produtividade por Colaborador', 40, 50);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(40, 60, doc.internal.pageSize.getWidth() - 40, 60);

      const tabela = {
        startY: 80,
        head: [[
          'Colaborador',
          'Contatados',
          'Retornaram',
          'Finalizados',
          'Prontuário',
          'Ganhos',
          'Pendências'
        ]],
        body: colaboradorRows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      };

      if (typeof doc.autoTable === 'function') {
        doc.autoTable(tabela);
      } else {
        autoTable(doc, tabela);
      }

      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || (doc.previousAutoTable && doc.previousAutoTable.finalY) || (yOffset + 60);
      
      const chartsContainer = document.getElementById('charts-container');
      if (chartsContainer && chartsContainer.children.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('Gráficos de Desempenho', 40, 50);
        doc.setDrawColor(200, 200, 200);
        doc.line(40, 60, doc.internal.pageSize.getWidth() - 40, 60);

        let currentChartY = 90;
        
        for (let i = 0; i < chartsContainer.children.length; i++) {
          const chartElement = chartsContainer.children[i];
          const canvas = await html2canvas(chartElement, { scale: 1.5 });
          const imgData = canvas.toDataURL('image/png');
          
          const pdfWidth = doc.internal.pageSize.getWidth() - 80;
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          if (currentChartY + pdfHeight > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            currentChartY = 40;
          }
          
          doc.addImage(imgData, 'PNG', 40, currentChartY, pdfWidth, pdfHeight);
          currentChartY += pdfHeight + 30; // Espaço entre os gráficos
        }
      }

      doc.save(`relatorio-${dataFiltro}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Falha ao gerar o PDF. Veja o console do navegador para detalhes.');
    } finally {
      setExporting(false);
    }
  };

  const exportarPlanilha = () => {
    if (!relatorioDiario) return;

    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      const resumoData = [
        ['Campo', 'Valor'],
        ['Data', formatDateBR(relatorioDiario.data)],
        ['Leads Contatados', relatorioDiario.totalContatados],
        ['Retornaram', relatorioDiario.totalRetornaram || 0],
        ['Finalizados', relatorioDiario.totalFinalizados],
        ['Prontuário', relatorioDiario.totalProntuario],
        ['Ganhos', relatorioDiario.totalGanhos],
        ['Pendências', relatorioDiario.totalPendencias],
        ['Taxa de Conversão', `${relatorioDiario.totalContatados > 0 ? (((relatorioDiario.totalRetornaram || 0) / relatorioDiario.totalContatados) * 100).toFixed(1) : 0}%`]
      ];

      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo');

      const colaboradoresData = [
        ['Colaborador', 'Contatados', 'Retornaram', 'Finalizados', 'Prontuário', 'Ganhos', 'Pendências']
      ];
      relatoriosColaborador.forEach((colaborador) => {
        colaboradoresData.push([
          colaborador.nome,
          colaborador.totais.contatados,
          colaborador.totais.retornaram || 0,
          colaborador.totais.finalizados,
          colaborador.totais.prontuario,
          colaborador.totais.ganhos,
          colaborador.totais.pendencias
        ]);
      });
      const wsColaboradores = XLSX.utils.aoa_to_sheet(colaboradoresData);
      XLSX.utils.book_append_sheet(workbook, wsColaboradores, 'Colaboradores');

      const evolucaoData = [
        ['Data', 'Contatados', 'Finalizados', 'Prontuário', 'Ganhos', 'Pendências', 'Colaboradores Ativos']
      ];
      evolucaoTemporal.forEach((row) => {
        evolucaoData.push([
          formatDateBR(row.data),
          row.total_contatados,
          row.total_finalizados,
          row.total_prontuario,
          row.total_ganhos,
          row.total_pendencias,
          row.colaboradores_ativos
        ]);
      });
      const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
      XLSX.utils.book_append_sheet(workbook, wsEvolucao, 'Evolução');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `relatorio-${dataFiltro}.xlsx`);
    } catch (error) {
      console.error('Erro ao gerar Planilha:', error);
      alert('Falha ao gerar a Planilha. Veja o console do navegador para detalhes.');
    } finally {
      setExporting(false);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Relatórios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Relatórios automáticos de produtividade
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportarPDF} disabled={exporting} className="flex items-center justify-center space-x-2">
            <FiDownload className="w-5 h-5" />
            <span>Exportar PDF</span>
          </Button>
          <Button onClick={exportarPlanilha} disabled={exporting} className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white border-transparent">
            <FiDownload className="w-5 h-5" />
            <span>Exportar Planilha (Excel/Sheets)</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <FiCalendar className="w-5 h-5 text-gray-400" />
          <Input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Relatório Diário */}
      {relatorioDiario && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Relatório Diário - {formatDateBR(relatorioDiario.data)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{relatorioDiario.totalContatados}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Contatados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{relatorioDiario.totalRetornaram}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Retornaram</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{relatorioDiario.totalFinalizados}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Finalizados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{relatorioDiario.totalGanhos}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ganhos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{relatorioDiario.totalPendencias}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendências</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {relatorioDiario.colaboradorDestaque}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Colaborador Destaque</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {relatorioDiario.percentualMeta}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentual da Meta</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {relatorioDiario.totalContatados > 0 ? ((relatorioDiario.totalRetornaram / relatorioDiario.totalContatados) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
            </div>
          </div>

          <div id="charts-container" className="mt-10 grid gap-6 grid-cols-1">
            <ChartCard
              title="Finalizados por Colaborador"
              type="bar"
              data={relatoriosColaborador.map((item) => ({ nome: item.nome, finalizados: item.totais.finalizados }))}
              dataKey="finalizados"
              xAxisKey="nome"
            />
            <ChartCard
              title="Distribuição de Resultados"
              type="pie"
              data={[
                { name: 'Contatados', value: relatorioDiario.totalContatados },
                { name: 'Finalizados', value: relatorioDiario.totalFinalizados },
                { name: 'Ganhos', value: relatorioDiario.totalGanhos },
                { name: 'Pendências', value: relatorioDiario.totalPendencias }
              ]}
              dataKey="value"
            />
            <ChartCard
              title="Evolução Temporal"
              type="line"
              data={evolucaoTemporal.map((item) => ({
                data: formatDateBR(item.data),
                total_finalizados: item.total_finalizados
              }))}
              dataKey="total_finalizados"
              xAxisKey="data"
            />
          </div>


          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sugestões de Melhoria
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              {getSugestoes().map((sugestao, index) => (
                <li key={index}>{sugestao}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Relatório por Colaborador */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Produtividade por Colaborador
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Colaborador</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Contatados</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Retornaram</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Finalizados</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Prontuário</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Ganhos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Pendências</th>
              </tr>
            </thead>
            <tbody>
              {relatoriosColaborador.map((relatorio, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {relatorio.nome}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.contatados}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.retornaram || 0}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.finalizados}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.prontuario}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.ganhos}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    {relatorio.totais.pendencias}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;