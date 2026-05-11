import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function Grafico({ registros }) {
  const resumoPorAtividade = registros.reduce((acc, item) => {
    const key = item.atividade;
    acc[key] = (acc[key] || 0) + Number(item.horas);
    return acc;
  }, {});

  const dados = Object.entries(resumoPorAtividade).map(([atividade, horas]) => ({
    atividade,
    horas,
  }));

  return (
    <div className="chart-box">
      <h2>Horas por atividade</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={dados} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="atividade" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="horas" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Grafico;
