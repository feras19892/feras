const symbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export function formatCurrency(cents: number, currency: string = 'EUR'): string {
  const value = (cents / 100).toFixed(2)
  const symbol = symbols[currency] ?? currency
  return `${value} ${symbol}`
}
