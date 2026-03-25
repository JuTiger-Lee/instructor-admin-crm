import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 전화번호 하이픈 자동 포맷
 * 010-0000-0000 형식
 */
export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

/**
 * 날짜 포맷
 * - 문자열 (YYYY-MM-DD) → YYYY.MM.DD
 * - 숫자 (Convex _creationTime timestamp) → YYYY.MM.DD
 */
export function formatDate(dateInput: string | number): string {
  if (typeof dateInput === 'number') {
    const date = new Date(dateInput)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}.${m}.${d}`
  }
  return dateInput.replace(/-/g, '.')
}
