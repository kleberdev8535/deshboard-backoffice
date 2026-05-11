function Tabela({ registros, loading }) {
  if (loading) {
    return (
      <div className="table-box">
        <h2>Registros</h2>
        <p>Carregando registros...</p>
      </div>
    );
  }

  return (
    <div className="table-box">
      <h2>Registros</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Colaborador</th>
            <th>Atividade</th>
            <th>Horas</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => (
            <tr key={registro.id}>
              <td>{registro.id}</td>
              <td>{registro.colaborador}</td>
              <td>{registro.atividade}</td>
              <td>{registro.horas}</td>
              <td>{registro.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tabela;
