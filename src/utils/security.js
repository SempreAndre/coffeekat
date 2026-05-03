/**
 * Coffee Kat - Módulo de Segurança do Frontend
 * 
 * Baseado nas recomendações de:
 * https://dev.to/lariazevedo/seguranca-no-front-end-dos-ataques-a-prevencao-6b0
 * 
 * Validações e sanitizações para prevenção de:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection (na camada de input do front)
 * - CSRF (Cross-Site Request Forgery)
 */

/**
 * Padrões maliciosos para detecção de SQLi e XSS
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^>]*>/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /document\.(cookie|write|location)/gi,
  /window\.(location|open)/gi,
  /(<iframe|<object|<embed|<form)/gi,
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/gi,
  /(--|;|'|"|\\)/g,
]

/**
 * Sanitiza uma string removendo caracteres e padrões potencialmente perigosos.
 * O React já cuida do escaping na renderização JSX, mas esta função
 * é usada para validação dos dados ANTES de enviar ao backend.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  let sanitized = input.trim()

  // Remove tags HTML
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // Escape de caracteres especiais
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  return sanitized
}

/**
 * Verifica se a entrada contém padrões potencialmente maliciosos.
 * Retorna true se a entrada for segura, false se contiver padrões perigosos.
 */
export function isInputSafe(input) {
  if (typeof input !== 'string') return true
  return !DANGEROUS_PATTERNS.some((pattern) => pattern.test(input))
}

/**
 * Validações específicas de campos
 */
export const validators = {
  email: (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!value) return 'Email é obrigatório'
    if (!regex.test(value)) return 'Email inválido'
    if (!isInputSafe(value)) return 'Email contém caracteres não permitidos'
    return null
  },

  password: (value) => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
    if (!/[A-Z]/.test(value)) return 'Senha deve ter pelo menos uma letra maiúscula'
    if (!/[a-z]/.test(value)) return 'Senha deve ter pelo menos uma letra minúscula'
    if (!/[0-9]/.test(value)) return 'Senha deve ter pelo menos um número'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Senha deve ter pelo menos um caractere especial'
    return null
  },

  name: (value) => {
    if (!value || !value.trim()) return 'Nome é obrigatório'
    if (value.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres'
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return 'Nome contém caracteres inválidos'
    if (!isInputSafe(value)) return 'Nome contém caracteres não permitidos'
    return null
  },

  phone: (value) => {
    if (!value) return 'Telefone é obrigatório'
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 11) return 'Telefone inválido'
    return null
  },

  cpf: (value) => {
    if (!value) return 'CPF/Passaporte é obrigatório'
    const cleaned = value.replace(/\D/g, '')
    // Aceita CPF (11 dígitos) ou passaporte (alfanumérico, 6-9 chars)
    if (cleaned.length === 11) {
      // Validação básica de CPF
      if (/^(\d)\1{10}$/.test(cleaned)) return 'CPF inválido'
      return null
    }
    // Passaporte
    if (/^[A-Za-z0-9]{6,9}$/.test(value.replace(/\s/g, ''))) return null
    return 'CPF (11 dígitos) ou Passaporte (6-9 caracteres) inválido'
  },

  address: (value) => {
    if (!value) return null // Endereço é opcional no cadastro
    if (!isInputSafe(value)) return 'Endereço contém caracteres não permitidos'
    return null
  },

  nickname: (value) => {
    if (!value) return null // Apelido é opcional
    if (value.length > 30) return 'Apelido deve ter no máximo 30 caracteres'
    if (!isInputSafe(value)) return 'Apelido contém caracteres não permitidos'
    return null
  },
}

/**
 * Wrapper seguro para fetch com autenticação via Session Cookie.
 * Envia cookies automaticamente para o backend (credentials: 'include').
 * O Session Cookie HttpOnly é gerenciado pelo navegador, não por JS.
 */
export async function secureFetch(url, options = {}) {
  const API_URL = import.meta.env.VITE_API_URL || ''

  // Se a URL não começa com http, adiciona o prefixo da API
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include', // Envia cookies cross-origin (Session Cookie)
  }

  // Sanitiza o body antes de enviar (se for string JSON)
  if (config.body && typeof config.body === 'string') {
    try {
      const parsed = JSON.parse(config.body)
      const sanitized = {}
      for (const [key, value] of Object.entries(parsed)) {
        sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : value
      }
      config.body = JSON.stringify(sanitized)
    } catch {
      // Se não for JSON, mantém como está
    }
  }

  return fetch(fullUrl, config)
}
