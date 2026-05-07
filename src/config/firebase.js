/**
 * Coffee Kat - Configuração do Firebase Client SDK
 * 
 * Este módulo é usado APENAS no frontend para autenticar o usuário
 * via Firebase Auth. A conexão com o Firestore NÃO acontece aqui;
 * todas as operações de banco são feitas pelo backend via API.
 * 
 * As variáveis VITE_ são públicas e seguras para expor no frontend.
 * A segurança real está no backend (Firebase Admin SDK + Session Cookies).
 */

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)

/**
 * Faz login com email/senha no Firebase Auth.
 * Retorna o ID Token que será enviado ao backend para criar a sessão.
 */
export async function firebaseLogin(email, password) {
  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  const idToken = await userCredential.user.getIdToken()
  return idToken
}

/**
 * Cria uma nova conta no Firebase Auth.
 * Retorna o ID Token para criar a sessão automaticamente após o cadastro.
 */
export async function firebaseRegister(email, password) {
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  const idToken = await userCredential.user.getIdToken()
  return { idToken, uid: userCredential.user.uid }
}

/**
 * Faz logout do Firebase Auth no cliente.
 */
export async function firebaseLogout() {
  await signOut(firebaseAuth)
}
