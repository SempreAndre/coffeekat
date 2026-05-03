/**
 * Coffee Kat Backend - Inicialização do Firebase Admin SDK
 * 
 * Suporta dois modos de carregamento de credenciais:
 * 1. Variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON (para Vercel/produção)
 * 2. Arquivo JSON local (para desenvolvimento)
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let serviceAccount

// Modo 1: Credenciais via variável de ambiente (Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    console.log('✅ Credenciais Firebase carregadas via variável de ambiente')
  } catch (error) {
    console.error('❌ Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:', error.message)
    // process.exit(1) removido para não derrubar o worker do Vercel imediatamente
  }
}
// Modo 2: Credenciais via arquivo JSON (desenvolvimento local)
else {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json'
  try {
    const backendDir = resolve(__dirname, '..')
    const fullPath = resolve(backendDir, serviceAccountPath)
    serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'))
    console.log('✅ Credenciais Firebase carregadas via arquivo local')
  } catch (error) {
    console.error('❌ Erro ao carregar credenciais do Firebase:', error.message)
    console.error('   A variável FIREBASE_SERVICE_ACCOUNT_JSON não foi encontrada e o arquivo local também não.')
  }
}

// Corrige problema comum no Vercel onde os \n da private_key são escapados como \\n
if (serviceAccount && serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } else {
    console.warn("⚠️ Firebase Admin não foi inicializado (credenciais ausentes). As APIs falharão.")
  }
} catch (error) {
  console.error("❌ Erro CRÍTICO ao inicializar o Firebase Admin:", error.message)
}

export const db = admin.apps.length ? admin.firestore() : null
export const auth = admin.apps.length ? admin.auth() : null
export default admin
