/**
 * Coffee Kat Backend - Inicialização do Firebase Admin SDK
 * 
 * Este módulo inicializa o Firebase Admin com as credenciais
 * de serviço, dando acesso seguro ao Firestore e ao Auth
 * diretamente do servidor (sem expor chaves no frontend).
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json'

let serviceAccount
try {
  // Resolve o caminho relativo à pasta backend/ (pai de config/)
  const backendDir = resolve(__dirname, '..')
  const fullPath = resolve(backendDir, serviceAccountPath)
  serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'))
} catch (error) {
  console.error('❌ Erro ao carregar credenciais do Firebase:', error.message)
  console.error('   Verifique se o arquivo serviceAccountKey.json existe em backend/config/')
  console.error('   Baixe em: Firebase Console > Configurações > Contas de Serviço > Gerar chave')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const db = admin.firestore()
export const auth = admin.auth()
export default admin
