import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function combinarClases(...valores: ClassValue[]) {
  return twMerge(clsx(valores))
}
