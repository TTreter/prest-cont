import { useState, useCallback } from 'react'

/**
 * Hook para validação de formulários em tempo real.
 * Fornece feedback imediato sobre a validade dos campos.
 */
export function useFormValidation(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Função para validar um campo específico
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name]
    if (!rules) return null

    // Verifica se o campo é obrigatório
    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'Este campo é obrigatório'
    }

    // Verifica o comprimento mínimo
    if (rules.minLength && value && value.toString().length < rules.minLength) {
      return `Deve ter pelo menos ${rules.minLength} caracteres`
    }

    // Verifica o comprimento máximo
    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      return `Deve ter no máximo ${rules.maxLength} caracteres`
    }

    // Verifica padrão de email
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Formato de email inválido'
      }
    }

    // Verifica padrão personalizado
    if (rules.pattern && value) {
      if (!rules.pattern.test(value)) {
        return rules.patternMessage || 'Formato inválido'
      }
    }

    // Validação customizada
    if (rules.custom && value) {
      const customError = rules.custom(value, values)
      if (customError) return customError
    }

    return null
  }, [validationRules, values])

  // Função para atualizar o valor de um campo
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Valida o campo se já foi tocado
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  // Função para marcar um campo como tocado
  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Valida o campo quando é tocado
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [validateField, values])

  // Função para validar todos os campos
  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name])
      newErrors[name] = error
      if (error) isValid = false
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))

    return isValid
  }, [validationRules, validateField, values])

  // Função para resetar o formulário
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  // Função para obter props para um campo de input
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setFieldTouched(name),
    error: touched[name] && errors[name],
    'aria-invalid': touched[name] && !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  }), [values, errors, touched, setValue, setFieldTouched])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).every(key => !errors[key])
  }
}
