import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import disputeService from '@/services/disputeService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Building2, 
  Eye, 
  X, 
  DollarSign, 
  Sprout, 
  Briefcase,
  Gavel,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon
} from 'lucide-react'

const STATUS_TABS = [
  { id: 'all', label: 'All Cases' },
  { id: 'under_review', label: 'Under Review ⚖️' },
  { id: 'resolved', label: 'Resolved Rulings 🟢' }
]

export const AdminDisputes = () => {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatusTab, setSelectedStatusTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [resolvingId, setResolvingId] = useState(null)
  
  // Photo Lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const data = await disputeService.getAllDisputes()
      setDisputes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[AdminDisputes] Failed to load disputes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDisputes()
    setIsRefreshing(false)
    toast.success('Dispute arbitration docket updated from state node! ⚡')
  }

  // Execute Ruling Actions
  const handleExecuteRuling = async (disputeId, action) => {
    const actionLabels = {
      refund_trader: '100% Refund to Buyer (Consignment Cancelled)',
      split_85_15: 'Mutual Split (85% Farmer / 15% Buyer upon Delivery)',
      payout_farmer: '100% Payout to Farmer (upon Delivery)'
    }

    const confirmMsg = action === 'refund_trader'
      ? `Record statutory APMC ruling: "${actionLabels[action]}"? This will refund escrow funds to buyer and close the transaction.`
      : `Record statutory APMC ruling: "${actionLabels[action]}"? Escrow funds will remain safely held in vault until verified APMC delivery acceptance.`

    if (!window.confirm(confirmMsg)) {
      return
    }

    setResolvingId(disputeId)
    try {
      await disputeService.resolveDispute(disputeId, {
        action,
        notes: `Admin APMC arbitration ruling: ${actionLabels[action]}`
      })
      toast.success(`Statutory APMC Ruling Recorded: ${actionLabels[action]}! 🏛️`)
      await loadDisputes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record dispute ruling')
    } finally {
      setResolvingId(null)
    }
  }

  // Aggregate Metrics
  const activeDisputesCount = disputes.filter(
    (d) => d.status === 'under_review' || d.status === 'raised'
  ).length

  const totalLockedInDispute = disputes
    .filter((d) => d.status === 'under_review' || d.status === 'raised')
    .reduce((acc, d) => acc + (d.escrowAmount || 0), 0)

  const resolvedCount = disputes.filter((d) => d.status && d.status.startsWith('resolved_')).length

  // Filtered List
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const isResolved = d.status && d.status.startsWith('resolved_')
      const isUnderReview = d.status === 'under_review' || d.status === 'raised'

      if (selectedStatusTab === 'under_review' && !isUnderReview) return false
      if (selectedStatusTab === 'resolved' && !isResolved) return false

      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const caseId = (d._id || '').toLowerCase()
      const farmerName = (d.farmer?.name || '').toLowerCase()
      const traderName = (d.trader?.name || d.trader?.companyName || '').toLowerCase()
      const cropName = (d.cropListing?.name || '').toLowerCase()
      const reason = (d.reason || '').toLowerCase()

      return caseId.includes(q) || farmerName.includes(q) || traderName.includes(q) || cropName.includes(q) || reason.includes(q)
    })
  }, [disputes, selectedStatusTab, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Karnataka APMC Statutory Dispute Redressal Tribunal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Dispute Arbitration & Quality Claims ⚖️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Arbitrate quality grading variances, transit damage claims, and weighbridge shrinkage with binding escrow disbursement rulings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync APMC Docket
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Cases Pending Ruling</p>
            <h3 className="text-2xl font-black text-foreground">{activeDisputesCount} Active Hearings</h3>
            <span className="text-[11px] text-amber-600 font-medium">Awaiting APMC Arbitration</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Escrow Locked Under Dispute</p>
            <h3 className="text-2xl font-black text-purple-600 font-mono">₹{totalLockedInDispute.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-muted-foreground">Held safely in Escrow Vault</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Settled Rulings</p>
            <h3 className="text-2xl font-black text-emerald-600">{resolvedCount} Cases</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Binding Rulings Executed</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedStatusTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case #, producer, buyer, or crop..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => {
          const isResolved = dispute.status && dispute.status.startsWith('resolved_')
          const lockedAmount = dispute.escrowAmount || dispute.transaction?.amount || 0
          const proofPhotos = dispute.proofPhotos || []

          return (
            <div
              key={dispute._id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-5 ${
                isResolved
                  ? 'bg-card border-border/80 opacity-90'
                  : 'bg-card border-purple-500/40 shadow-md'
              }`}
            >
              {/* Header: Case #, Status, Escrow */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">
                      CASE #{String(dispute._id).slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {dispute.createdAt ? new Date(dispute.createdAt).toLocaleString('en-IN') : 'Recent'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {isResolved ? 'Resolved 🟢' : 'Under APMC Review ⚖️'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    Consignment: <strong className="text-foreground">{dispute.cropListing?.name || 'Agricultural Produce'}</strong>
                    {dispute.cropListing?.quantity ? ` (${dispute.cropListing.quantity} ${dispute.cropListing.unit || 'Qtl'})` : ''}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground block font-medium">Locked Escrow Vault:</span>
                  <span className="text-xl font-black text-purple-600 font-mono">
                    ₹{lockedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Producer & Buyer Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Farmer (Seller): {dispute.farmer?.name || 'Verified Farmer'}
                  </span>
                  <div className="text-muted-foreground space-y-0.5 text-[11px]">
                    {dispute.farmer?.mobile && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-600" /> {dispute.farmer.mobile}
                      </p>
                    )}
                    {dispute.farmer?.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-emerald-600" /> {dispute.farmer.email}
                      </p>
                    )}
                    {dispute.farmer?.district && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {dispute.farmer.district}, {dispute.farmer.state || 'Karnataka'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Trader (Buyer): {dispute.trader?.name || dispute.trader?.companyName || 'Registered Trader'}
                  </span>
                  <div className="text-muted-foreground space-y-0.5 text-[11px]">
                    {dispute.trader?.mobile && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-amber-600" /> {dispute.trader.mobile}
                      </p>
                    )}
                    {dispute.trader?.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-amber-600" /> {dispute.trader.email}
                      </p>
                    )}
                    {dispute.trader?.district && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-600" /> {dispute.trader.district}, {dispute.trader.state || 'Karnataka'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dispute Description */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Buyer Dispute Statement & Defect Report:
                </span>
                <p className="text-foreground font-medium pt-0.5">
                  "{dispute.reason || 'Consignment quality discrepancy reported by buyer.'}"
                </p>
              </div>

              {/* Photo Proofs Gallery */}
              {proofPhotos.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Photographic Proof Evidence ({proofPhotos.length}):
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {proofPhotos.map((photoUrl, idx) => {
                      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
                      const fullUrl = photoUrl.startsWith('http') || photoUrl.startsWith('blob:')
                        ? photoUrl
                        : `${apiBase}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`
                      return (
                        <div
                          key={idx}
                          onClick={() => setLightboxPhoto(fullUrl)}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity shadow-xs group"
                        >
                          <img
                            src={fullUrl}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Resolved Ruling Box or Action Buttons */}
              {isResolved ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Gavel className="w-4 h-4 text-purple-600" /> Official APMC Statutory Ruling Recorded
                    </span>
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                      {dispute.ruling?.action || dispute.status}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{dispute.ruling?.notes || 'Dispute resolved.'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-purple-500/20 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Farmer Eventual Payout:</span>
                      <strong className="text-emerald-600 font-mono">₹{(dispute.ruling?.farmerPayout || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Buyer Refund:</span>
                      <strong className="text-amber-600 font-mono">₹{(dispute.ruling?.traderRefund || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Ruling Date:</span>
                      <span className="text-foreground font-semibold">
                        {dispute.ruling?.resolvedAt ? new Date(dispute.ruling.resolvedAt).toLocaleDateString('en-IN') : 'Completed'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 pt-0.5">
                    {dispute.ruling?.action === 'refund_trader'
                      ? '✅ 100% refunded to buyer and harvest lot cancelled.'
                      : '🔒 Funds held in escrow. Payout will execute automatically when buyer confirms delivery at mandi.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground italic">
                    Escrow funds will remain safely locked until delivery is confirmed.
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolvingId === dispute._id}
                      onClick={() => handleExecuteRuling(dispute._id, 'refund_trader')}
                      className="rounded-xl text-xs h-9 font-semibold text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                    >
                      100% Refund to Buyer
                    </Button>

                    <Button
                      size="sm"
                      disabled={resolvingId === dispute._id}
                      onClick={() => handleExecuteRuling(dispute._id, 'split_85_15')}
                      className="rounded-xl text-xs h-9 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    >
                      Mutual Split (85% Farmer / 15% Buyer) ⚖️
                    </Button>

                    <Button
                      size="sm"
                      disabled={resolvingId === dispute._id}
                      onClick={() => handleExecuteRuling(dispute._id, 'payout_farmer')}
                      className="rounded-xl text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      100% Payout to Farmer 🌾
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredDisputes.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Disputes Found in Docket</p>
          <p className="text-xs text-muted-foreground">
            All harvest transactions are currently proceeding without active quality disputes. Any new dispute raised by buyers will appear here immediately.
          </p>
        </div>
      )}

      {/* 5. Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> APMC Disputed Consignment Photo Proof
              </span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img src={lightboxPhoto} alt="Dispute evidence enlarged" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDisputes
