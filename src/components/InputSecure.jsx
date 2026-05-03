import { useState, useCallback } from 'react'
import { sanitizeInput, isInputSafe } from '../utils/security.js'

/**
 * InputSecure - Campo de texto com validação de segurança embutida.
 * Previne XSS e SQL Injection antes mesmo de enviar ao servidor.
 */
export default function InputSecure({
  id,
  label,
  type = 'text',
  value,
  onChange,
  validator,
  placeholder = '',
  required = false,
  disabled = false,
  maxLength = 255,
  className = '',
  autoComplete,
  mask,
}) {
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  const handleChange = useCallback((e) => {
    let newValue = e.target.value

    // Aplica máscara se existir
    if (mask) {
      newValue = mask(newValue)
    }

    // Limita tamanho
    if (newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
    }

    // Verifica padrões perigosos em tempo real
    if (!isInputSafe(newValue)) {
      setError('Entrada contém caracteres não permitidos')
      // Não propaga o valor malicioso
      return
    }

    setError(null)
    onChange(newValue)
  }, [mask, maxLength, onChange])

  const handleBlur = useCallback(() => {
    setTouched(true)

    if (validator) {
      const validationError = validator(value)
      setError(validationError)
    }
  }, [validator, value])

  const sanitizedValue = typeof value === 'string' ? value : ''

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-coffee-700"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={sanitizedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-coffee-800 placeholder-coffee-400/60 
          transition-all duration-200 outline-none
          ${error && touched
            ? 'border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-cream-300 focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-cream-100' : ''}
        `}
      />

      {error && touched && (
        <span className="text-xs text-danger animate-fade-in" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
