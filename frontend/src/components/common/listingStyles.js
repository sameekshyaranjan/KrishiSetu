import { cn } from '@/lib/utils'

/**
 * Class-string helpers shared by crop-lot pages (farmer listings, trader marketplace).
 * `accent` switches the focus colour: farmer = forest green, trader = amber.
 */

const FOCUS = {
  farmer: 'focus:border-primary/50 focus:ring-primary/20',
  trader: 'focus:border-amber-500/60 focus:ring-amber-500/20'
}

export const fieldClass = (accent = 'farmer') =>
  cn(
    'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2',
    FOCUS[accent] || FOCUS.farmer
  )

// Responsive grid: single wide column at md, where the sidebar leaves little room (cards go horizontal)
export const LISTING_GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'

/** Card shell shared by both portals: vertical card, horizontal at tablet width */
export const lotCardClass = (muted) =>
  cn(
    'group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200 md:max-lg:flex-row',
    !muted && 'hover:border-foreground/15 hover:shadow-[0_6px_24px_-12px_rgba(20,40,25,0.25)]'
  )

export const lotImageWrapClass =
  'relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted md:max-lg:aspect-auto md:max-lg:w-[40%]'
