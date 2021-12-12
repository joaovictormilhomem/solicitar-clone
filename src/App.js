import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { onChangeRequest, startFirebase } from './services/firebase'
import { ToastContainer, toast } from 'react-toastify';

import Login from './pages/Login';
import NewRequest from './pages/NewRequest'
import SelectPlace from './pages/SelectPlace';

import Header from './components/Header';
import Loading from './components/Loading';

import useNavigatorOnLine from './hooks/useNavigatorOnline'

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const appVersion = 'Versão ALPHA 0.3';

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [placeOp, setPlaceOp] = useState(null);
  const [request, setRequest] = useState(false);
  const isOnline = useNavigatorOnLine();
  const toastId = useRef(null);

  const notifyConnectionLost = () => toastId.current = toast.error("Sem conexão", { autoClose: false });
  const notifyConnectionRestored = () => toast.update(toastId.current, { render: "Conexão restaurada", type: toast.TYPE.SUCCESS, autoClose: 3000 });

  function checkPlaceOp() {
    const storagePlaceOp = localStorage.getItem('PLACE_OP');
    if (storagePlaceOp) {
      setPlaceOp(storagePlaceOp);
      return storagePlaceOp;
    }
    else {
      setPlaceOp(false);
      return false;
    }
  }

  useEffect(() => {
    isOnline ? notifyConnectionRestored() : notifyConnectionLost();
  }, [isOnline]);

  useEffect(() => {
    const virtualPlaceOp = checkPlaceOp();

    if (virtualPlaceOp) {
      let unsubscribe = startFirebase(virtualPlaceOp, setCurrentUser);
      return (() => unsubscribe);
    }
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser !== null) {
      if (currentUser === false) {
        setLoading(false);
      }
      else{
        const unsubcribe = onChangeRequest(setRequest);
        return (() => unsubcribe);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (request !== false) {
      setLoading(false);
    }
  },[request]);

  return (
    <div className='main-wrapper'>

      <ToastContainer
        position='bottom-right'
        newestOnTop={false}
        closeOnClick={false}
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme='dark'
      />

      {loading && <Loading className='loading-screen' />}
      <Header version={appVersion} />

      <Router>
        <Switch>

          <Route exact path='/'>
            {placeOp ?
              (currentUser ?
                <Redirect to="/request" /> :
                <Redirect to="/login" />) :
              <SelectPlace setPlaceOp={setPlaceOp} />}
          </Route>

          <Route exact path='/login'>
            {placeOp ?
              (currentUser ?
                <Redirect to="/request" /> :
                <Login setCurrentUser={setCurrentUser} setLoading={setLoading} placeOp={placeOp} />) :
              <Redirect to="/" />}
          </Route>

          <Route path='/request'>
            {placeOp ?
              (currentUser ?
                <NewRequest request={request} setLoading={setLoading} setCurrentUser={setCurrentUser} /> :
                <Redirect to="/login" />) :
              <Redirect to="/" />}
          </Route>

          <Route path='*'>
            <h1>Essa página não existe</h1>
          </Route>

        </Switch>
      </Router>
    </div>
  );
}

export default App;