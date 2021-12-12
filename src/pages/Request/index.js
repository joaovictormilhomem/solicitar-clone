import { useEffect } from "react"
import { deleteReference } from "../../services/firebase"
import "./style.css"

function Request({ request, setLoading }) {
  const step1 = () => {
    if (request.status === 2) return "finished"
    else if (request.status === 3) return "denied"
    else return "active"
  }
  const step2 = () => {
    if (request.status === 1) return "active"
    else if (request.status === 2) return "finished"
    else if (request.status === 3) return "denied"
  }
  const step3 = () => {
    if (request.status === 2) return "finished"
    else if (request.status === 3) return "denied"
  }

  useEffect(() => {
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDeleteReqClick(event) {
    event.preventDefault();
    deleteReference();
  }

  return (
    <div className="screen slide-in request-screen">
      <h1 className="request-pon">{request.pon}</h1>

      <div className="container">
        <ul className="progressbar">
          <li
            data-step="1"
            className={step1()}>
            Aguardando
          </li>
          <li
            data-step="2"
            className={step2()}>
            Validando
          </li>
          <li
            data-step="3"
            className={step3()}>
            {request.status === 3 ? 'Negado' : 'Validado'}
          </li>
        </ul>
      </div>

      {request.status > 1 ?
        <div className="request-denied-actions">
          <div className="request-reason text-base">{request.reason}</div>
          <button onClick={handleDeleteReqClick} className="request-delete-btn">NOVA SOLICITAÇÃO</button>
        </div>
        :
        <div></div>
      }

    </div>
  );
}

export default Request;