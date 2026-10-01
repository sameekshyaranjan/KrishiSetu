/**
 * Presentational helpers shared by crop-lot pages (farmer listings, trader marketplace).
 * Pure formatting only — no business logic.
 */

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'

export const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE
}

export const formatINR = (value) => `₹${(Number(value) || 0).toLocaleString('en-IN')}`

// Indian short-scale for summary figures: ₹1.25 L, ₹2.4 Cr
export const formatINRCompact = (value) => {
  const n = Number(value) || 0
  if (n >= 1e7) return `₹${parseFloat((n / 1e7).toFixed(2))} Cr`
  if (n >= 1e5) return `₹${parseFloat((n / 1e5).toFixed(2))} L`
  return formatINR(n)
}

export const formatDate = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

const UNIT_LABELS = {
  quintal: { short: 'qtl', singular: 'quintal', plural: 'quintals' },
  ton: { short: 'MT', singular: 'tonne', plural: 'tonnes' },
  tonne: { short: 'MT', singular: 'tonne', plural: 'tonnes' },
  kg: { short: 'kg', singular: 'kg', plural: 'kg' },
  crate: { short: 'crate', singular: 'crate', plural: 'crates' },
  bag: { short: 'bag', singular: 'bag', plural: 'bags' }
}
export const unitLabel = (unit) => UNIT_LABELS[(unit || '').toLowerCase().replace(/s$/, '')] || UNIT_LABELS.quintal

export const formatQuantity = (quantity, unit) => {
  const n = Number(quantity) || 0
  const u = unitLabel(unit)
  return `${n.toLocaleString('en-IN')} ${n === 1 ? u.singular : u.plural}`
}

const CATEGORY_LABELS = {
  vegetables: 'Vegetables',
  grains: 'Grains & cereals',
  spices: 'Spices & cash crops',
  fruits: 'Fruits',
  pulses: 'Pulses & legumes',
  other: 'Other'
}
export const categoryLabel = (c) => CATEGORY_LABELS[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Produce')
