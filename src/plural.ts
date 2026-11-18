/** Українська множина: 1 розділ, 2 розділи, 5 розділів */
export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return one
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few
  return many
}
