// Demo amounts and future API amounts are USD. Never infer an exchange rate here.
const compactUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, trailingZeroDisplay: 'stripIfInteger', maximumFractionDigits: 2 })
const explicitUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'code', minimumFractionDigits: 2, trailingZeroDisplay: 'stripIfInteger', maximumFractionDigits: 2 })
export function formatUSD(value, { explicit = false } = {}) {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim()) || !['number', 'string'].includes(typeof value)) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? (explicit ? explicitUSD : compactUSD).format(amount) : null
}
