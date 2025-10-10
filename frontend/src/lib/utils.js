import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para combinar classes CSS de forma condicional e resolver conflitos do Tailwind CSS.
 * Usa `clsx` para construir strings de nome de classe condicionalmente e `tailwind-merge` para mesclar
 * classes do Tailwind CSS de forma inteligente, resolvendo conflitos.
 * @param {...(string|object|Array)} inputs - Uma lista de classes CSS, objetos ou arrays a serem combinados.
 * @returns {string} A string de classes CSS mescladas.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

