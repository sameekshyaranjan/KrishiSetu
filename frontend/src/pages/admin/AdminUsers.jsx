import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import adminUserService from '@/services/adminUserService'
import exportService from '@/services/exportService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  X, 
  Eye, 
  Ban, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Sprout, 
  Briefcase, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react'

const ROLE_TABS = [
  { id: 'all', label: 'All Registered Entities' },
  { id: 'farmer', label: 'Producers & FPOs 🌾' },
  { id: 'trader', label: 'Wholesale Buyers 💼' }
]

export const AdminUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserForModal, setSelectedUserForModal] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await adminUserService.getAllUsers()
      setUsers(data || [])
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadUsers()
    setIsRefreshing(false)
    toast.success('Karnataka APMC user directory synchronized! ⚡')
  }

  const handleToggleSuspension = async (u) => {
    const updated = await adminUserService.toggleSuspension(u.role, u._id)
    setUsers(updated)
    const nextStatus = u.status === 'active' ? 'Suspended ⛔' : 'Reactivated 🟢'
    toast.success(`Account for ${u.name} is now ${nextStatus}`)
  }

  const handleVerifyTrader = async (traderId, status) => {
    const updated = await adminUserService.verifyTraderLicense(traderId, status)
    setUsers(updated)
    toast.success(`APMC License verification status set to ${status.toUpperCase()}! 🛡️`)
    setSelectedUserForModal(null)
  }

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRole === 'all' || u.role === selectedRole
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (u._id || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.district || '').toLowerCase().includes(q) ||
        (u.gstin || '').toLowerCase().includes(q) ||
        (u.fruitsId || '').toLowerCase().includes(q)

      return matchesRole && matchesSearch
    })
  }, [users, selectedRole, searchQuery])

  // Key Counts
  const totalFarmers = users.filter((u) => u.role === 'farmer').length
  const totalTraders = users.filter((u) => u.role === 'trader').length
  const verifiedCount = users.filter((u) => u.kycVerified).length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Live Directory Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Karnataka APMC Directorate Registered Marketplace Participants</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User & Entity Management 👥
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Audit farmer FRUITS credentials, authenticate wholesale APMC licenses, and govern account suspensions.
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
            Refresh Directory
          </Button>

          <Button 
            onClick={() => exportService.exportUserRegistry(filteredUsers)}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-primary text-primary-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Registry CSV
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Registered Producers & FPOs</p>
            <h3 className="text-2xl font-black text-foreground">{totalFarmers} Farmers</h3>
            <span className="text-[11px] text-emerald-600 font-medium">100% Bhoomi RTC Seeded</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Wholesale Trading Firms</p>
            <h3 className="text-2xl font-black text-amber-600">{totalTraders} Buyers</h3>
            <span className="text-[11px] text-muted-foreground">Unified APMC License Mandate</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">KYC Verification Rate</p>
            <h3 className="text-2xl font-black text-primary">{Math.round((verifiedCount / (users.length || 1)) * 100)}%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">{verifiedCount} of {users.length} Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Role Tabs & Search Controls */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedRole === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, GSTIN, FRUITS ID, or district..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Users Cards Grid */}
      <div className="space-y-4">
        {filteredUsers.map((u) => {
          const isFarmer = u.role === 'farmer'
          const isSuspended = u.status === 'suspended'

          return (
            <div
              key={u._id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-5 ${
                isSuspended
                  ? 'bg-rose-500/5 border-rose-500/30 opacity-90'
                  : 'bg-card border-border hover:border-primary/50 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">{u._id}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isFarmer
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {isFarmer ? 'Farmer / FPO 🌾' : 'Wholesale Buyer 💼'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSuspended
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                      {isSuspended ? 'Suspended ⛔' : 'Active Account 🟢'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-foreground mt-1">{u.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {u.district}, Karnataka
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-medium">Lifetime APMC Turnover:</span>
                  <span className="text-xl font-black text-primary font-mono">
                    ₹{u.lifetimeTradeTurnover?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">Contact Credentials:</span>
                  <p className="text-muted-foreground">{u.email}</p>
                  <p className="text-foreground font-mono font-semibold">{u.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">
                    {isFarmer ? 'Landholding & AgriStack:' : 'Corporate Compliance:'}
                  </span>
                  {isFarmer ? (
                    <>
                      <p className="text-primary font-mono font-bold">{u.fruitsId}</p>
                      <p className="text-muted-foreground">{u.landAcreage} Acres Cultivable</p>
                    </>
                  ) : (
                    <>
                      <p className="text-amber-600 font-mono font-bold">{u.apmcLicense}</p>
                      <p className="text-muted-foreground font-mono text-[11px]">GSTIN: {u.gstin}</p>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">KYC Verification Status:</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {u.kycVerified ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> FRUITS & APMC Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Pending Approval
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Joined: {u.joinedDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                {!isFarmer && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyTrader(u._id, u.verificationStatus === 'approved' ? 'rejected' : 'approved')}
                    className="rounded-xl text-xs h-9 font-semibold"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" />
                    {u.verificationStatus === 'approved' ? 'Revoke License' : 'Approve APMC License 🟢'}
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => handleToggleSuspension(u)}
                  className={`rounded-xl text-xs font-bold h-9 px-4 shadow-sm ${
                    isSuspended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5 mr-1.5" />
                  {isSuspended ? 'Reactivate Account' : 'Suspend Account ⛔'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminUsers
