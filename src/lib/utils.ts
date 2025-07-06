import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Budget range utilities
export const BUDGET_RANGES = {
  'low': { min: 50, max: 150, label: '$50-150' },
  'medium': { min: 150, max: 300, label: '$150-300' },
  'high': { min: 300, max: 500, label: '$300-500' },
  'premium': { min: 500, max: 1000, label: '$500-1000' },
  'luxury': { min: 1000, max: 10000, label: '$1000+' }
} as const

export function getBudgetRange(budgetKey: keyof typeof BUDGET_RANGES) {
  return BUDGET_RANGES[budgetKey] || BUDGET_RANGES.medium
}

// Room type mappings
export const ROOM_CATEGORIES = {
  'living': ['ceiling', 'floor', 'table', 'accent'],
  'bedroom': ['ceiling', 'bedside', 'reading', 'accent'],
  'kitchen': ['ceiling', 'under-cabinet', 'pendant', 'island'],
  'bathroom': ['ceiling', 'vanity', 'mirror', 'shower'],
  'office': ['ceiling', 'desk', 'floor', 'accent'],
  'hallway': ['ceiling', 'wall', 'accent']
} as const

export function getRoomCategories(roomType: string) {
  return ROOM_CATEGORIES[roomType as keyof typeof ROOM_CATEGORIES] || ROOM_CATEGORIES.living
}

// Style preferences
export const STYLE_PREFERENCES = [
  'modern',
  'traditional',
  'industrial',
  'scandinavian',
  'vintage',
  'minimalist'
] as const

export type StylePreference = typeof STYLE_PREFERENCES[number]

// Format price for display
export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Generate unique ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}