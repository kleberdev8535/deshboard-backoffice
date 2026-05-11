import { useState } from 'react';

function Formulario({ onSubmit }) {
  const [colaborador, setColaborador] = useState('');
  const [atividade, setAtividade] = useState('');
  const [horas, setHoras] = useState('');
  const [data, setData] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ colaborador, atividade, horas: Number(horas), data });
    setColaborador('');
    setAtividade('');
    setHoras('');
    setData('');
  };

  return (
    <div className="form-box">
      <h2>Novo registro</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Colaborador
          <input
            value={colaborador}
            onChange={(event) => setColaborador(event.target.value)}
            placeholder="Nome do colaborador"
            required
          />
        </label>
        <label>
          Atividade
          <input
            value={atividade}
            onChange={(event) => setAtividade(event.target.value)}
            placeholder="Descrição da atividade"
            required
          />
        </label>
        <label>
          Horas
          <input
            type="number"
            step="0.1"
            value={horas}
            onChange={(event) => setHoras(event.target.value)}
            placeholder="Horas gastas"
            required
          />
        </label>
        <label>
          Data
          <input
            type="date"
            value={data}
            onChange={(event) => setData(event.target.value)}
            required
          />
        </label>
        <button type="submit">Salvar registro</button>
      </form>
    </div>
  );
}

export default Formulario;
