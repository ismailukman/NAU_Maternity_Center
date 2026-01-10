import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function calculatePregnancyWeek(lastMenstrualPeriod: Date): number {
  const today = new Date()
  const lmp = new Date(lastMenstrualPeriod)
  const diffTime = Math.abs(today.getTime() - lmp.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

export function calculateExpectedDeliveryDate(lastMenstrualPeriod: Date): Date {
  const lmp = new Date(lastMenstrualPeriod)
  lmp.setDate(lmp.getDate() + 280) // 40 weeks
  return lmp
}
