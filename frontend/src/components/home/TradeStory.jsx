import { useState, useEffect, useRef } from 'react'

const story = [
  {
    n: '01',
    overline: 'Farm gate',
    title: 'Direct Harvest Listing',
    copy: 'Raju Patel in Kolar grades 40 Qtl of Hybrid Tomatoes, completes a photo audit, records today’s 05:30 AM harvest, and sets a ₹2,100 reserve floor.',
    image: '/images/farmer_harvest_hero.jpg',
    stat: '40 Qtl',
    statLabel: 'Grade A · photo audited',
    caption: 'Raju Patel · Kolar farm gate',
    verification: 'Lot KA-KLR-882 · harvest timestamp 05:30 · reserve ₹2,100/Qtl',
  },
  {
    n: '02',
    overline: 'Market',
    title: 'Agmarknet APMC Price Discovery',
    copy: 'The live Kolar modal benchmark of ₹2,200/Qtl is synced from Karnataka APMC terminals, giving both sides the same reference before bidding.',
    image: '/images/apmc_mandi_trading.jpg',
    stat: '₹2,200',
    statLabel: 'live modal benchmark',
    caption: 'Kolar APMC · price terminal',
    verification: 'Agmarknet modal · Kolar APMC · synced across 140+ Karnataka mandis',
  },
  {
    n: '03',
    overline: 'Exchange',
    title: 'Real-Time Bidding & Sub-50ms Counters',
    copy: 'Licensed traders submit competitive bids while Raju negotiates formal counters in one attributable, time-stamped exchange.',
    image: '/images/farmer_trader_partnership.jpg',
    stat: '<50 ms',
    statLabel: 'counter dispatch',
    caption: 'Verified farmer–trader exchange',
    verification: '12 verified bids · top offer ₹2,240 · counter actions recorded',
  },
  {
    n: '04',
    overline: 'Trade',
    title: 'Pre-Funded Escrow & Farm-Gate Logistics',
    copy: 'The buyer deposits ₹89,600 before pickup. A digital weight slip verifies dispatch and releases the farmer’s DBT payout.',
    image: '/images/logistics_produce_truck.jpg',
    stat: '₹89,600',
    statLabel: 'locked before pickup',
    caption: 'Farm-gate dispatch · Kolar',
    verification: 'Escrow funded · pickup authorized · digital weight release pending',
  },
]

export const TradeStory = () => {
  const [activeStory, setActiveStory] = useState(0)
  const storyRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = Number(visible.target.dataset.story)
          if (!Number.isNaN(idx)) {
            setActiveStory(idx)
          }
        }
      },
      { rootMargin: '-25% 0px -30% 0px', threshold: [0.15, 0.5, 0.8] }
    )
    storyRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <section id="trade-story" className="bg-secondary py-20 lg:py-28 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
          
          {/* LEFT: Sticky Photo Showcase with Proper Fading */}
          <div className="top-24 h-fit lg:sticky">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-strong border border-border shadow-xl">
              {story.map((stage, index) => (
                <img
                  key={stage.image}
                  src={stage.image}
                  alt={stage.title}
                  loading="lazy"
                  width={1408}
                  height={1008}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
                    activeStory === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}

              {/* Photo Caption Badge */}
              <span className="absolute left-4 top-4 bg-background/90 backdrop-blur-xs px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground border border-border">
                {story[activeStory]?.caption}
              </span>

              {/* Bottom Stat Card & Indicator Dots */}
              <div className="absolute inset-x-0 bottom-0 bg-surface-strong/90 backdrop-blur-md p-5 text-surface-strong-foreground border-t border-white/10">
                <div className="grid grid-cols-[1fr_auto] items-end gap-5">
                  <div>
                    <p className="font-display text-3xl">{story[activeStory]?.stat}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">
                      {story[activeStory]?.statLabel}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {story.map((stage, index) => (
                      <button
                        key={stage.n}
                        className={`h-2 rounded-xs transition-all duration-300 ${
                          activeStory === index ? 'w-8 bg-trader' : 'w-2.5 bg-primary-foreground/30 hover:bg-primary-foreground/50'
                        }`}
                        onClick={() => {
                          setActiveStory(index)
                          storyRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        aria-label={`View stage ${stage.n}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Headlines and Narrative Progression */}
          <div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                One accountable trade
              </p>
              <h2 className="mt-3 max-w-xl font-display text-4xl leading-none sm:text-5xl text-foreground">
                From harvest to handover.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                Every material action is verified against the lot—not buried in a call, handwritten slip, or broker ledger.
              </p>
            </div>

            <div className="mt-9 space-y-2">
              {story.map((stage, index) => (
                <article
                  key={stage.n}
                  ref={(node) => {
                    storyRefs.current[index] = node
                  }}
                  data-story={index}
                  onClick={() => {
                    setActiveStory(index)
                    storyRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className={`relative min-h-[280px] lg:min-h-[420px] cursor-pointer border-l-2 pl-7 pt-8 transition-all duration-300 lg:pl-10 ${
                    activeStory === index ? 'border-primary opacity-100' : 'border-border opacity-40 hover:opacity-75'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    Stage {stage.n} · {stage.overline}
                  </p>
                  <h3 className="mt-4 max-w-md font-display text-3xl sm:text-4xl leading-none text-foreground">{stage.title}</h3>
                  <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">{stage.copy}</p>
                  <div
                    className={`mt-6 border-l-2 p-4 text-xs leading-5 transition-colors ${
                      activeStory === index
                        ? 'border-primary bg-market text-market-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em]">Ledger verification</span>
                    {stage.verification}
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default TradeStory
