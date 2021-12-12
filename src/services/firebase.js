import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier, signOut } from "firebase/auth";
import { getDatabase, query, ref, onValue, child, push, update, serverTimestamp, off } from "firebase/database";
import { defineFirebaseConfig } from '../config/firebaseConfig';

let auth;
let database;

export function startFirebase(placeOp, setCurrentUser) {
  const firebaseConfig = defineFirebaseConfig(placeOp);
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  auth.languageCode = 'pt-br';

  const unsubscribeOnAuthStateChanged = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
    }
    else
      setCurrentUser(false);
  })

  return unsubscribeOnAuthStateChanged;
}

export function startRecaptcha(placeOp, setCurrentUser) {
  !auth && startFirebase(placeOp, setCurrentUser);
  window.recaptchaVerifier = new RecaptchaVerifier('login-btn', {
    'size': 'invisible',
  }, auth);
}

export function onChangeRequest(setRequest) {
  const number = auth.currentUser.phoneNumber;
  const reference = query(ref(database, `techs/${number}`));
  const unsubscribe = onValue(reference, (snapshot) => {
    const request = snapshot.val();
    setRequest(request);
    return () => off(`techs/${number}`, unsubscribe);
  });
}

export function createRequest(pon, type, notes) {
  const requestData = {
    pon,
    type,
    notes,
    createTime: serverTimestamp(),
    status: 0,
    techNumber: auth.currentUser.phoneNumber
  };
  const newRequestKey = push(child(ref(database), 'requests')).key;
  const updates = {};
  updates['/requests/' + newRequestKey] = requestData;
  updates['/techs/' + auth.currentUser.phoneNumber] = requestData;
  update(ref(database), updates);
}

export function deleteReference() {
  const updates = {};
  updates['/techs/' + auth.currentUser.phoneNumber] = null;
  update(ref(database), updates);
}

export function sendLoginCode(phoneNumber) {
  return new Promise((resolve) => {
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        resolve(confirmationResult);
      }).catch((error) => {
        resolve(error);
      });
  })
}

export function checkLoginCode(code) {
  return new Promise((resolve) => {
    window.confirmationResult.confirm(code).then((result) => {
      const response = { user: result.user };
      resolve(response);
    }).catch((error) => {
      const response = { error: error };
      resolve(response);
    });
  })
}

export const logout = (setCurrentUser) => {
  return new Promise((resolve) => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      resolve(null);
    }).catch((error) => {
      resolve(error);
    });
  })
}