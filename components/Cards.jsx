function Cards({ registros }) {
  const totalHoras = registros.reduce((sum, item) => sum + Number(item.horas), 0);
  const totalRegistros = registros.length;
  const colaboradoresUnicos = [...new Set(registros.map((item) => item.colaborador))].length;

  return (
    <div className="card-list">
      <div className="card">
        <h3>Total de horas</h3>
        <p>{totalHoras.toFixed(1)}h</p>
      </div>
      <div className="card">
        <h3>Registros</h3>
        <p>{totalRegistros}</p>
      </div>
      <div className="card">
        <h3>Colaboradores</h3>
        <p>{colaboradoresUnicos}</p>
      </div>
    </div>
  );
}

export default Cards;
