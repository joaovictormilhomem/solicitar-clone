import { useState } from 'react';
import { createRequest, logout } from '../../services/firebase';
import Request from '../Request';
import './style.css'

function NewRequest({ request, setLoading, setCurrentUser }) {
  const [op, setOp] = useState('CxLotada');
  const [id, setId] = useState('');
  const [notes, setNotes] = useState('');

  function clearStates() {
    setOp('CxLotada');
    setId('');
    setNotes('');
  }

  function pasteId() {
    //navigator.clipboard.readText().then(text => setId(text));
  }

  async function handleLogoutClick(event) {
    event.preventDefault();
    setLoading(true);
    const response = await logout(setCurrentUser);
    !response && setLoading(false);
  }

  function handleNewReqClick(event) {
    if ([6, 10, 14].includes(id.length)) {
      event.preventDefault();
      setLoading(true);
      createRequest(id, op, notes);
      clearStates();
    }
    else alert("Insira um identificador válido!");
  }

  return (
    request ?
      <Request request={request} setLoading={setLoading} />
      :
      <div className="screen slide-in validate-screen">
        <h1 className="title">Nova Solicitação</h1>

        <form className="tech-form">
          <select className="select-op" value={op} onChange={e => setOp(e.target.value)}>
            <option value="CxLotada">Caixa lotada</option>
            <option value="Metalico">Suporte metálico</option>
          </select>
          <div className="input-container">
            <input type="text" id="user-input" placeholder="Identificador Único" value={id} onChange={e => setId(e.target.value)} />
            <div id="paste-btn" onClick={pasteId} />
          </div>
          <textarea placeholder="Anotações" value={notes} onChange={e => setNotes(e.target.value)} id="story" name="story" rows="7" maxLength="280" />
          <button onClick={handleNewReqClick} type='button' id="send-btn">Solicitar</button>
        </form>

        <div onClick={handleLogoutClick} id="logout-btn" className="footer-btn">Desconectar</div>
      </div>
  );
}

export default NewRequest;