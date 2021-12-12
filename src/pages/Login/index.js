import React, { useState, useEffect } from 'react';
import { checkLoginCode, sendLoginCode, startRecaptcha } from '../../services/firebase';
import translateError from '../../services/authErrors';
import './style.css';

const initialFormValues = {
  number: '',
  code: '',
  error: false
}

function Login({ setCurrentUser, setLoading, placeOp }) {

  const [formValues, setFormValues] = useState(initialFormValues);
  const [codeIsSent, setCodeIsSent] = useState(false);

  function handleFormChangesValues(event) {
    const inputElement = event.target;
    const inputName = inputElement.name;
    const inputValue = inputElement.value;
    setFormValues({ ...formValues, [inputName]: inputValue });
  }

  async function handleSendCodeClick(event) {
    event.preventDefault();
    setLoading(true);
    const number = '+55' + formValues.number;
    if (number.length === 14) {
      const loginResponse = await sendLoginCode(number);
      if (loginResponse) {
        const errorMessage = translateError(loginResponse);
        setFormValues({ ...formValues, error: errorMessage });
      }
      setCodeIsSent(true);
    }
    else alert('Insira um número válido (ddd + número de 9 digitos)');
    setLoading(false);
  }

  async function handleCheckCodeClick(event) {
    event.preventDefault();
    const checkCodeResponse = await checkLoginCode(formValues.code);
    if (checkCodeResponse.error) {
      const errorMessage = translateError(checkCodeResponse.error);
      setFormValues({ ...formValues, error: errorMessage });
    }
    else
      setCurrentUser(checkCodeResponse.user);
  }

  useEffect(() => {
    startRecaptcha(placeOp, setCurrentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div id="login-screen" className="screen slide-in">
      <div className="login-container slide-in">
        <h1>Login</h1>
        <form id="login-form" className="form">
          {codeIsSent ?
            <>
              <label htmlFor="password-input">Código</label>
              <input
                autoComplete="current-password"
                onChange={handleFormChangesValues}
                value={formValues.code}
                type="tel"
                className="form-input"
                id="password-input"
                placeholder="Digite o código"
                name="code"
              />
              <button
                type="submit" id="code-btn"
                onClick={handleCheckCodeClick}
                className="form-btn"
              >Entrar
              </button>
            </>
            :
            <>
              <label htmlFor="user-input">Telefone</label>
              <input
                autoFocus
                autoComplete="phone"
                onChange={handleFormChangesValues}
                value={formValues.number}
                type="tel"
                className="form-input selection-if-bg-white"
                id="user-input"
                placeholder="6212345678"
                name="number"
              />
              <button
                type="submit" id="login-btn"
                onClick={handleSendCodeClick}
                className="form-btn"
              >Enviar SMS
              </button>
              <a
                className="report"
                rel="noreferrer"
                target="_blank"
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=DmBElwQ-Lkm6oSXsJFxvEMj6KzbOSdtOlRpJOU-tlRxUQjlDRUdRNTdBSThWWkVTTzM3N0ZVRDdWVi4u"
              >
                Está enfrentando algum problema?
              </a>
              <div id="recaptcha"></div>
            </>
          }
          {formValues.error && <span className="error">{formValues.error}</span>}
        </form>
      </div>
    </div>
  );
}

export default Login;