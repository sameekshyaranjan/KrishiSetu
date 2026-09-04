import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import schemeService from '@/services/schemeService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  BookOpen, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck, 
  X, 
  Sparkles, 
  Layers,
  ArrowUpRight,
  Globe,
  XCircle,
  Clock
} from 'lucide-react'

const STATUS_TABS = [
  { id: 'all', label: 'All Schemes' },
  { id: 'pending', label: 'Pending Moderation ⏳' },
  { id: 'published', label: 'Published & Live 🟢' },
  { id: 'rejected', label: 'Rejected / Archived 🔴' }
]

export const AdminSchemes = () => {
  const { user } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(null)

  // New Scheme Form State
  const [newScheme, setNewScheme] = useState({
    name: '',
    category: 'Karnataka State Special',
    portal: 'raitamitra.karnataka.gov.in',
    officialLink: 'https://raitamitra.karnataka.gov.in',
    purpose: '',
    eligibility: '',
    benefits: ''
  })

  const loadSchemes = async () => {
    setLoading(true)
    try {
      const data = await schemeService.getAllSchemes()
      setSchemes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[AdminSchemes] Failed to load schemes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchemes()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadSchemes()
    setIsRefreshing(false)
    toast.success('Government welfare schemes synchronized with state database! ⚡')
  }

  const handleSyncFromGov = async () => {
    setIsSyncing(true)
    try {
      const res = await schemeService.syncSchemes()
      toast.success(res?.message || 'Ingested official schemes from .gov.in and .nic.in portals! 🏛️')
      await loadSchemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync government schemes')
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePublish = async (id, name) => {
    setActionInProgress(id)
    try {
      await schemeService.publishScheme(id)
      toast.success(`"${name}" approved & published to public schemes portal! 🟢`)
      await loadSchemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish scheme')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleReject = async (id, name) => {
    setActionInProgress(id)
    try {
      await schemeService.rejectScheme(id)
      toast.success(`"${name}" rejected and hidden from public portal. 🔴`)
      await loadSchemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject scheme')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleCreateScheme = async (e) => {
    e.preventDefault()
    if (!newScheme.name.trim() || !newScheme.purpose.trim()) {
      toast.error('Please enter scheme name and purpose.')
      return
    }

    try {
      await schemeService.createScheme({
        ...newScheme,
        status: 'published',
        isPublished: true
      })
      toast.success('New scheme created and published successfully! 🎉')
      setShowAddModal(false)
      setNewScheme({
        name: '',
        category: 'Karnataka State Special',
        portal: 'raitamitra.karnataka.gov.in',
        officialLink: 'https://raitamitra.karnataka.gov.in',
        purpose: '',
        eligibility: '',
        benefits: ''
      })
      await loadSchemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create scheme')
    }
  }

  // Aggregate Metrics
  const totalSchemes = schemes.length
  const pendingCount = schemes.filter(s => s.status === 'pending' || (!s.status && !s.isPublished)).length
  const publishedCount = schemes.filter(s => s.status === 'published' || (s.isPublished && s.status !== 'rejected')).length
  const rejectedCount = schemes.filter(s => s.status === 'rejected').length

  // Filtered List
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const isPub = s.status === 'published' || (s.isPublished && s.status !== 'rejected')
      const isPend = s.status === 'pending' || (!s.status && !s.isPublished)
      const isRej = s.status === 'rejected'

      if (selectedTab === 'pending' && !isPend) return false
      if (selectedTab === 'published' && !isPub) return false
      if (selectedTab === 'rejected' && !isRej) return false

      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const name = (s.name || s.title || '').toLowerCase()
      const purpose = (s.purpose || s.description || '').toLowerCase()
      const category = (s.category || '').toLowerCase()
      const portal = (s.portal || '').toLowerCase()

      return name.includes(q) || purpose.includes(q) || category.includes(q) || portal.includes(q)
    })
  }, [schemes, selectedTab, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>Karnataka & Central Agricultural Welfare Schemes Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Government Welfare & Subsidy Schemes 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ingest schemes from authorized government portals (.gov.in / .nic.in) and moderate publication to the public farmer repository.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncFromGov}
            disabled={isSyncing}
            className="rounded-xl text-xs h-10 px-4 font-bold border-purple-500/30 text-purple-600 hover:bg-purple-500/10 shadow-sm"
          >
            <Globe className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-purple-600' : ''}`} />
            {isSyncing ? 'Ingesting from .gov.in...' : 'Sync Official Schemes (.gov.in)'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            onClick={() => setShowAddModal(true)}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Scheme
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Catalog Repository</p>
            <h3 className="text-2xl font-black text-foreground">{totalSchemes} Schemes</h3>
            <span className="text-[11px] text-muted-foreground">Central & State Feeds</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Pending Moderation</p>
            <h3 className="text-2xl font-black text-amber-600">{pendingCount} Awaiting</h3>
            <span className="text-[11px] text-amber-600 font-medium">Drafts from Ingestion</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Live on Public Portal</p>
            <h3 className="text-2xl font-black text-emerald-600">{publishedCount} Published</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Visible to Farmers</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Rejected / Archived</p>
            <h3 className="text-2xl font-black text-rose-600">{rejectedCount} Archived</h3>
            <span className="text-[11px] text-muted-foreground">Hidden from public</span>
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
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTab === tab.id
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
              placeholder="Search scheme name, category, portal..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => {
          const isPublished = scheme.status === 'published' || (scheme.isPublished && scheme.status !== 'rejected')
          const isPending = scheme.status === 'pending' || (!scheme.status && !scheme.isPublished)
          const isRejected = scheme.status === 'rejected'
          const name = scheme.name || scheme.title || 'Government Scheme'
          const portalName = scheme.portal || (scheme.officialLink ? new URL(scheme.officialLink).hostname : 'gov.in')

          return (
            <div
              key={scheme._id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isPublished
                  ? 'bg-card border-emerald-500/30 shadow-sm'
                  : isPending
                  ? 'bg-card border-amber-500/40 shadow-sm'
                  : 'bg-card border-border/80 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Portal, Category, Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    {scheme.category || 'Agricultural Welfare'}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    isPublished
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : isPending
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {isPublished ? 'Published 🟢' : isPending ? 'Pending Moderation ⏳' : 'Rejected 🔴'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-foreground tracking-tight">
                    {name}
                  </h3>
                  <a
                    href={scheme.officialLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-600 hover:underline pt-0.5 font-semibold"
                  >
                    <Globe className="w-3 h-3" /> {portalName} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {scheme.purpose || scheme.description}
                </p>

                {/* Benefits / Eligibility Box */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1.5">
                  {scheme.benefits && (
                    <div className="flex items-start gap-1.5">
                      <strong className="text-emerald-600 shrink-0">Benefits:</strong>
                      <span className="text-foreground">{scheme.benefits}</span>
                    </div>
                  )}
                  {scheme.eligibility && (
                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <strong className="text-foreground shrink-0">Eligibility:</strong>
                      <span>{scheme.eligibility}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {String(scheme._id).slice(-8).toUpperCase()}
                </span>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionInProgress === scheme._id}
                        onClick={() => handleReject(scheme._id, name)}
                        className="rounded-xl text-xs h-8 px-3 text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        Reject 🔴
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionInProgress === scheme._id}
                        onClick={() => handlePublish(scheme._id, name)}
                        className="rounded-xl text-xs h-8 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        Publish 🟢
                      </Button>
                    </>
                  )}

                  {isPublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionInProgress === scheme._id}
                      onClick={() => handleReject(scheme._id, name)}
                      className="rounded-xl text-xs h-8 px-3 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      Unpublish / Hide 🔴
                    </Button>
                  )}

                  {isRejected && (
                    <Button
                      size="sm"
                      disabled={actionInProgress === scheme._id}
                      onClick={() => handlePublish(scheme._id, name)}
                      className="rounded-xl text-xs h-8 px-3 font-bold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Re-Publish 🟢
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredSchemes.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Government Schemes Found</p>
          <p className="text-xs text-muted-foreground">
            Click "Sync Official Schemes (.gov.in)" to ingest schemes from Indian and Karnataka state portals into your moderation queue.
          </p>
          <Button onClick={handleSyncFromGov} size="sm" className="rounded-xl text-xs font-bold">
            <Globe className="w-3.5 h-3.5 mr-1" /> Sync Official Schemes Now
          </Button>
        </div>
      )}

      {/* 5. Create Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    Add Government Welfare Scheme
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Register state or central subsidy policy with public portal visibility
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Scheme Official Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka Krishi Yantra Dhare"
                  value={newScheme.name}
                  onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Mechanization"
                    value={newScheme.category}
                    onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Government Portal</label>
                  <input
                    type="text"
                    placeholder="e.g. raitamitra.karnataka.gov.in"
                    value={newScheme.portal}
                    onChange={(e) => setNewScheme({ ...newScheme, portal: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Official Portal URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newScheme.officialLink}
                  onChange={(e) => setNewScheme({ ...newScheme, officialLink: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Purpose / Policy Objective <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of agricultural welfare assistance provided..."
                  value={newScheme.purpose}
                  onChange={(e) => setNewScheme({ ...newScheme, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Subsidies & Benefits</label>
                <input
                  type="text"
                  placeholder="e.g. 50% custom hiring subsidy on heavy machinery"
                  value={newScheme.benefits}
                  onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. Small & marginal farmers holding Bhoomi RTC"
                  value={newScheme.eligibility}
                  onChange={(e) => setNewScheme({ ...newScheme, eligibility: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button
                  type="submit"
                  className="flex-1 rounded-xl text-xs font-bold h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  Publish to Scheme Repository 🏛️
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminSchemes
