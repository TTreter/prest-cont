import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Aplica máscara a um valor baseado no padrão fornecido.
 * @param {string} value - Valor a ser mascarado
 * @param {string} mask - Padrão da máscara (ex: "999.999.999-99")
 * @returns {string} Valor mascarado
 */
function applyMask(value, mask) {
  if (!value || !mask) return value

  let maskedValue = ''
  let valueIndex = 0
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    const maskChar = mask[i]
    const valueChar = value[valueIndex]
    
    if (maskChar === '9') {
      // Aceita apenas dígitos
      if (/\d/.test(valueChar)) {
        maskedValue += valueChar
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === 'A') {
      // Aceita apenas letras
      if (/[a-zA-Z]/.test(valueChar)) {
        maskedValue += valueChar.toUpperCase()
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === '*') {
      // Aceita qualquer caractere
      maskedValue += valueChar
      valueIndex++
    } else {
      // Caractere fixo da máscara
      maskedValue += maskChar
    }
  }
  
  return maskedValue
}

/**
 * Remove a máscara de um valor, mantendo apenas os caracteres válidos.
 * @param {string} value - Valor mascarado
 * @param {string} mask - Padrão da máscara
 * @returns {string} Valor sem máscara
 */
function removeMask(value, mask) {
  if (!value || !mask) return value

  let unmaskedValue = ''
  let maskIndex = 0
  
  for (let i = 0; i < value.length && maskIndex < mask.length; i++) {
    const valueChar = value[i]
    const maskChar = mask[maskIndex]
    
    if (maskChar === '9' && /\d/.test(valueChar)) {
      unmaskedValue += valueChar
      maskIndex++
    } else if (maskChar === 'A' && /[a-zA-Z]/.test(valueChar)) {
      unmaskedValue += valueChar
      maskIndex++
    } else if (maskChar === '*') {
      unmaskedValue += valueChar
      maskIndex++
    } else if (valueChar === maskChar) {
      maskIndex++
    }
  }
  
  return unmaskedValue
}

/**
 * Componente de input com máscara.
 * Suporta máscaras personalizadas usando os padrões:
 * - 9: dígito (0-9)
 * - A: letra (a-z, A-Z)
 * - *: qualquer caractere
 */
export const MaskedInput = forwardRef(({
  mask,
  value = '',
  onChange,
  onValueChange,
  placeholder,
  className,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(() => 
    mask ? applyMask(value, mask) : value
  )

  const handleChange = (e) => {
    const inputValue = e.target.value
    
    if (!mask) {
      setDisplayValue(inputValue)
      onChange?.(e)
      onValueChange?.(inputValue)
      return
    }

    // Remove caracteres que não fazem parte da máscara
    const unmasked = removeMask(inputValue, mask)
    const masked = applyMask(unmasked, mask)
    
    setDisplayValue(masked)
    
    // Chama onChange com o valor mascarado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: masked
      }
    }
    onChange?.(syntheticEvent)
    
    // Chama onValueChange com o valor sem máscara
    onValueChange?.(unmasked)
  }

  const handleKeyDown = (e) => {
    // Permite navegação e edição
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]
    
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Permite Ctrl+A, Ctrl+C, Ctrl+V, etc.
    if (e.ctrlKey || e.metaKey) {
      return
    }
    
    if (!mask) {
      return
    }
    
    // Verifica se o caractere é válido para a posição atual
    const currentPos = e.target.selectionStart
    const maskChar = mask[currentPos]
    
    if (maskChar === '9' && !/\d/.test(e.key)) {
      e.preventDefault()
    } else if (maskChar === 'A' && !/[a-zA-Z]/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Input
      ref={ref}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || mask}
      className={cn("font-mono", className)}
      {...props}
    />
  )
})

MaskedInput.displayName = "MaskedInput"

/**
 * Componentes pré-configurados para máscaras comuns.
 */
export const CPFInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="999.999.999-99"
    placeholder="000.000.000-00"
    {...props}
  />
))

export const CNPJInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="99.999.999/9999-99"
    placeholder="00.000.000/0000-00"
    {...props}
  />
))

export const PhoneInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="(99) 99999-9999"
    placeholder="(00) 00000-0000"
    {...props}
  />
))

export const CEPInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="99999-999"
    placeholder="00000-000"
    {...props}
  />
))

export const DateInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="99/99/9999"
    placeholder="dd/mm/aaaa"
    {...props}
  />
))

export const TimeInput = forwardRef((props, ref) => (
  <MaskedInput
    ref={ref}
    mask="99:99"
    placeholder="hh:mm"
    {...props}
  />
))

CPFInput.displayName = "CPFInput"
CNPJInput.displayName = "CNPJInput"
PhoneInput.displayName = "PhoneInput"
CEPInput.displayName = "CEPInput"
DateInput.displayName = "DateInput"
TimeInput.displayName = "TimeInput"
