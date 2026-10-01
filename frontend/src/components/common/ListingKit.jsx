import { Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fieldClass } from './listingStyles'

/**
 * Shared building blocks for crop-lot pages (farmer listings, trader marketplace)
 * so both portals present lots with the same layout and controls.
 * `accent` switches the focus colour: farmer = forest green, trader = amber.
 */

export const SelectField = ({ value, onChange, children, className, selectClassName, accent, ...props }) => (
  <div className={cn('relative', className)}>
    <select
      value={value}
      onChange={onChange}
      className={cn(fieldClass(accent), 'cursor-pointer appearance-none pr-9', selectClassName)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
)

export const SearchInput = ({ value, onChange, placeholder, accent, className, ...props }) => (
  <div className={cn('relative', className)}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(fieldClass(accent), 'bg-card pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden')}
      {...props}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
)

/** Segmented control with counts, e.g. All 12 · Live 8 · Sold 4 */
export const SegmentedTabs = ({ tabs, value, onChange, label, className }) => (
  <div
    role="tablist"
    aria-label={label}
    className={cn('grid rounded-lg bg-muted p-1 sm:inline-grid sm:w-auto sm:self-start', className)}
    style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
  >
    {tabs.map(({ key, label: tabLabel, count }) => {
      const isActive = value === key
      return (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(key)}
          className={cn(
            'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 py-[7px] text-[13px] font-medium transition-colors sm:px-4',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
            isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="truncate">{tabLabel}</span>
          {count !== undefined && (
            <span
              className={cn(
                'text-[11px] tabular-nums',
                isActive ? 'text-muted-foreground' : 'text-muted-foreground/70',
                tabs.length > 3 && 'hidden sm:inline' // keep labels readable when 4+ tabs share a phone row
              )}
            >
              {count}
            </span>
          )}
        </button>
      )
    })}
  </div>
)

/** Three-figure insight strip shown above the toolbar */
export const SummaryStrip = ({ items, label }) => (
  <section
    aria-label={label}
    className="grid divide-x divide-border rounded-xl border border-border bg-card"
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
  >
    {items.map(({ label: itemLabel, value, hint, valueClassName }) => (
      <div key={itemLabel} className="flex min-w-0 flex-col px-3 py-3.5 sm:px-5 sm:py-4">
        <p className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">{itemLabel}</p>
        <p className={cn('mt-auto truncate pt-1 text-lg font-bold tabular-nums leading-tight text-foreground sm:text-[22px]', valueClassName)}>
          {value}
        </p>
        <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">{hint}</p>
      </div>
    ))}
  </section>
)

/** One cell of the Quantity / Reserve / Offer spec row on a lot card */
export const Fact = ({ label, value, sub, valueClassName }) => (
  <div className="min-w-0 px-3 py-2.5">
    <dt className="truncate text-[11px] font-medium text-muted-foreground">{label}</dt>
    <dd className={cn('mt-0.5 truncate text-[15px] font-semibold leading-tight tabular-nums text-foreground', valueClassName)}>
      {value}
    </dd>
    <dd className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</dd>
  </div>
)

export const FactRow = ({ children }) => (
  <dl className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-muted/40">{children}</dl>
)

/** Pill shown on the card photo (status / bid state) */
export const PhotoPill = ({ dot, children }) => (
  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
    <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
    {children}
  </span>
)

export const FormLabel = ({ htmlFor, children, required, hint }) => (
  <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[13px] font-medium text-foreground">
    <span>
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
    {hint && <span className="text-[11px] font-normal text-muted-foreground">{hint}</span>}
  </label>
)

export const FormSection = ({ title, description, children }) => (
  <section className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
)

/** "Showing X of Y · Clear filters" line under the toolbar */
export const ResultsMeta = ({ shown, total, noun = 'lots', onClear }) => (
  <div className="-mt-2 flex items-center justify-between text-xs text-muted-foreground">
    <span>
      Showing <span className="font-semibold text-foreground">{shown}</span> of {total} {noun}
    </span>
    <button type="button" onClick={onClear} className="font-medium text-foreground underline-offset-2 hover:underline">
      Clear filters
    </button>
  </div>
)

export const ListingCardSkeleton = () => (
  <div className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-card md:max-lg:flex-row">
    <div className="aspect-[16/9] w-full bg-muted md:max-lg:aspect-auto md:max-lg:w-[40%]" />
    <div className="flex-1 space-y-3 p-4">
      <div className="h-2.5 w-20 rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
      <div className="h-[70px] rounded-lg bg-muted" />
      <div className="flex gap-2 pt-1">
        <div className="h-9 flex-1 rounded-lg bg-muted" />
        <div className="h-9 flex-1 rounded-lg bg-muted" />
      </div>
    </div>
  </div>
)
