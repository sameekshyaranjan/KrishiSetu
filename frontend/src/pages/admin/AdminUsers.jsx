import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
  Sparkles
} from 'lucide-react'

const DEMO_USERS = [
  {
    _id: 'USR-KA-FRM-001',
    name: 'Ramesh Gowda',
    email: 'farmer1@krishisetu.com',
    mobile: '+91 98451 23456',
    role: 'farmer',
    district: 'Hassan',
    village: 'Belur Village',
    kycStatus: 'verified', // 'verified' | 'pending' | 'clarification' | 'suspended'
    documentType: 'Bhoomi RTC Land Record',
    docId: 'RTC-HSN-88192',
    landArea: '5.4 Acres',
    crops: ['Tomato', 'Potato', 'Maize'],
    joinedDate: '12 Jan 2026'
  },
  {
    _id: 'USR-KA-TRD-001',
    name: 'Suresh Hegde (KA Agro Traders)',
    email: 'trader1@krishisetu.com',
    mobile: '+91 98860 55432',
    role: 'trader',
    district: 'Bengaluru Urban',
    village: 'Yeshwanthpur APMC Yard',
    kycStatus: 'verified',
    documentType: 'APMC Unified License',
    docId: 'KA-BLR-TRD-2026',
    gstin: '29AABCK9921D1Z8',
    category: 'Category-A Wholesale',
    joinedDate: '15 Jan 2026'
  },
  {
    _id: 'USR-KA-FRM-002',
    name: 'Nagaraju Byrappa',
    email: 'nagaraju.mnd@gmail.com',
    mobile: '+91 97410 88214',
    role: 'farmer',
    district: 'Mandya',
    village: 'Malavalli Village',
    kycStatus: 'pending',
    documentType: 'Bhoomi RTC Land Record',
    docId: 'RTC-MND-44210',
    landArea: '4.8 Acres',
    crops: ['Sugarcane', 'Onion'],
    joinedDate: '28 Aug 2026'
  },
  {
    _id: 'USR-KA-TRD-002',
    name: 'Coastal Agro Processing Corp',
    email: 'procurement@coastalagro.in',
    mobile: '+91 99002 44120',
    role: 'trader',
    district: 'Mangaluru',
    village: 'Baikampady Industrial Yard',
    kycStatus: 'pending',
    documentType: 'APMC Unified License',
    docId: 'KA-MNG-TRD-2026',
    gstin: '29AABCC4412K1Z9',
    category: 'Category-A Wholesale',
    joinedDate: '28 Aug 2026'
  },
  {
    _id: 'USR-KA-FRM-003',
    name: 'Savitramma Gowda',
    email: 'savitramma.hsn@gmail.com',
    mobile: '+91 98801 11290',
    role: 'farmer',
    district: 'Hassan',
    village: 'Alur Village',
    kycStatus: 'pending',
    documentType: 'Bhoomi RTC Land Record',
    docId: 'RTC-HSN-11290',
    landArea: '6.2 Acres',
    crops: ['Ginger', 'Cardamom', 'Tomato'],
    joinedDate: '27 Aug 2026'
  },
  {
    _id: 'USR-KA-FRM-004',
    name: 'Channappa Gowda',
    email: 'channappa.blr@gmail.com',
    mobile: '+91 94480 33112',
    role: 'farmer',
    district: 'Bengaluru Rural',
    village: 'Doddaballapura',
    kycStatus: 'verified',
    documentType: 'Bhoomi RTC Land Record',
    docId: 'RTC-BLR-44102',
    landArea: '8.0 Acres',
    crops: ['Yellow Maize', 'Poultry Feed Grains'],
    joinedDate: '10 Feb 2026'
  },
  {
    _id: 'USR-KA-TRD-003',
    name: 'Mysuru Wholesale Spices Ltd',
    email: 'trade@mysuruspices.com',
    mobile: '+91 98440 99881',
    role: 'trader',
    district: 'Mysuru',
    village: 'Bandiplaya APMC Market',
    kycStatus: 'clarification',
    documentType: 'FSSAI & APMC License',
    docId: 'KA-MYS-TRD-8819',
    gstin: '29AABCM8821P1Z4',
    category: 'Category-B Spices & Pulses',
    joinedDate: '20 Aug 2026'
  },
  {
    _id: 'USR-KA-FRM-005',
    name: 'Venkatesh Murthy',
    email: 'venkatesh.klr@gmail.com',
    mobile: '+91 99805 77612',
    role: 'farmer',
    district: 'Kolar',
    village: 'Bangarapet',
    kycStatus: 'verified',
    documentType: 'Bhoomi RTC Land Record',
    docId: 'RTC-KLR-99214',
    landArea: '3.5 Acres',
    crops: ['Organic Ragi', 'Tomato'],
    joinedDate: '01 Mar 2026'
  }
]

const ROLE_TABS = [
  { id: 'all', label: 'All Stakeholders' },
  { id: 'farmer', label: '🌾 Farmers' },
  { id: 'trader', label: '💼 Traders' },
  { id: 'pending', label: '⚠️ Pending KYC' },
  { id: 'suspended', label: '⛔ Suspended' }
]

const KARNATAKA_DISTRICTS = [
  'All Districts',
  'Hassan',
  'Mandya',
  'Belagavi',
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Kolar',
  'Mysuru',
  'Mangaluru',
  'Tumakuru',
  'Hubballi-Dharwad'
]

export const AdminUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState(DEMO_USERS)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserForKyc, setSelectedUserForKyc] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Stakeholder user directory synchronized with State APMC node!')
    }, 600)
  }

  const handleApproveUser = (id, name) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, kycStatus: 'verified' } : u))
    )
    setSelectedUserForKyc(null)
    toast.success(`KYC Approved for ${name}! Clearance certificate issued. 🟢`)
  }

  const handleClarifyUser = (id, name) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, kycStatus: 'clarification' } : u))
    )
    setSelectedUserForKyc(null)
    toast.error(`Clarification requested from ${name}.`)
  }

  const handleToggleSuspend = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'verified' : 'suspended'
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, kycStatus: nextStatus } : u))
    )
    if (nextStatus === 'suspended') {
      toast.error(`Account for ${name} has been suspended ⛔`)
    } else {
      toast.success(`Account for ${name} restored & active 🟢`)
    }
  }

  // Filtered Directory
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        selectedRole === 'all'
          ? true
          : selectedRole === 'pending'
          ? u.kycStatus === 'pending'
          : selectedRole === 'suspended'
          ? u.kycStatus === 'suspended'
          : u.role === selectedRole

      const matchesDistrict =
        selectedDistrict === 'All Districts' ? true : u.district === selectedDistrict

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobile.includes(q) ||
        u._id.toLowerCase().includes(q) ||
        u.docId.toLowerCase().includes(q)

      return matchesRole && matchesDistrict && matchesSearch
    })
  }, [users, selectedRole, selectedDistrict, searchQuery])

  // Counts
  const totalVerifiedFarmers = users.filter((u) => u.role === 'farmer' && u.kycStatus === 'verified').length
  const totalVerifiedTraders = users.filter((u) => u.role === 'trader' && u.kycStatus === 'verified').length
  const totalPendingKyc = users.filter((u) => u.kycStatus === 'pending').length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Statewide Stakeholder Access & Regulatory KYC Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Stakeholder Directory & KYC Moderation 👥
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Audit farmer Bhoomi RTC land documents, verify corporate APMC wholesale permits, and govern platform access control.
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
            onClick={() => toast.success('Statewide Stakeholder Directory exported to Excel!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Directory
          </Button>
        </div>
      </div>

      {/* 2. 4 Stakeholder KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Stakeholders</span>
          <p className="text-2xl font-black text-foreground">1,482 Users</p>
          <span className="text-[11px] text-muted-foreground">Registered Statewide</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Verified Farmers</span>
          <p className="text-2xl font-black text-emerald-600">1,240 Producers</p>
          <span className="text-[11px] text-emerald-600 font-bold">Bhoomi RTC Land Linked</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Licensed Traders</span>
          <p className="text-2xl font-black text-primary">242 Buyers</p>
          <span className="text-[11px] text-primary font-bold">APMC Verified Licensees</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Pending KYC Moderation</span>
          <p className="text-2xl font-black text-amber-600">{totalPendingKyc} Requests</p>
          <span className="text-[11px] text-amber-600 font-semibold">Action Required</span>
        </div>
      </div>

      {/* 3. Search & Multi-Facet Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Role Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
            {ROLE_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? users.length
                  : tab.id === 'pending'
                  ? users.filter((u) => u.kycStatus === 'pending').length
                  : tab.id === 'suspended'
                  ? users.filter((u) => u.kycStatus === 'suspended').length
                  : users.filter((u) => u.role === tab.id).length

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedRole === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    selectedRole === tab.id ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-card border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, mobile, email, Bhoomi RTC number, or APMC license ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
      </div>

      {/* 4. Stakeholder User Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="p-4">Stakeholder Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">District / Location</th>
                <th className="p-4">KYC Document & Record</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.role === 'farmer' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {u.role === 'farmer' ? <Sprout className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-foreground">{u.name}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{u.email} • {u.mobile}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'farmer'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-foreground">{u.district}</p>
                    <span className="text-[10px] text-muted-foreground">{u.village}</span>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-foreground">{u.documentType}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{u.docId}</span>
                  </td>

                  <td className="p-4">
                    {u.kycStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Verified 🟢
                      </span>
                    )}
                    {u.kycStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Pending Review 🟡
                      </span>
                    )}
                    {u.kycStatus === 'clarification' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                        Clarification Req 🔴
                      </span>
                    )}
                    {u.kycStatus === 'suspended' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-700 text-[10px] font-bold border border-rose-500/30">
                        Suspended ⛔
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedUserForKyc(u)}
                        className="rounded-xl text-xs h-8 px-2.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-purple-600" /> Inspect KYC
                      </Button>

                      <button
                        onClick={() => handleToggleSuspend(u._id, u.name, u.kycStatus)}
                        title={u.kycStatus === 'suspended' ? 'Restore User' : 'Suspend User'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.kycStatus === 'suspended'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border hover:text-rose-500 hover:bg-rose-500/10'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Full-Screen KYC Inspection & Document Audit Modal */}
      {selectedUserForKyc && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    State APMC KYC Document Verification Audit
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Application ID: {selectedUserForKyc._id}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUserForKyc(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Profile Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Applicant Name</span>
                <p className="font-extrabold text-foreground">{selectedUserForKyc.name}</p>
                <span className="text-[11px] text-muted-foreground">{selectedUserForKyc.email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Location Jurisdiction</span>
                <p className="font-extrabold text-foreground">{selectedUserForKyc.district}</p>
                <span className="text-[11px] text-muted-foreground">{selectedUserForKyc.village}</span>
              </div>
            </div>

            {/* Document Scanned Preview Box */}
            <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> {selectedUserForKyc.documentType}
                </span>
                <span className="text-[10px] text-slate-400">Govt Verified Seal</span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <p><span className="text-slate-500">IDENTIFIER:</span> {selectedUserForKyc.docId}</p>
                {selectedUserForKyc.landArea && (
                  <p><span className="text-slate-500">PARCEL AREA:</span> {selectedUserForKyc.landArea} (Bhoomi Database Matched)</p>
                )}
                {selectedUserForKyc.crops && (
                  <p><span className="text-slate-500">CROPS GROWN:</span> {selectedUserForKyc.crops.join(', ')}</p>
                )}
                {selectedUserForKyc.gstin && (
                  <p><span className="text-slate-500">GSTIN TAX ID:</span> {selectedUserForKyc.gstin} (Active 29AABCK)</p>
                )}
                {selectedUserForKyc.category && (
                  <p><span className="text-slate-500">LICENSE SCOPE:</span> {selectedUserForKyc.category}</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button 
                variant="outline"
                onClick={() => handleClarifyUser(selectedUserForKyc._id, selectedUserForKyc.name)}
                className="rounded-xl text-xs h-10 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
              >
                Request Clarification ⚠️
              </Button>

              <Button 
                onClick={() => handleApproveUser(selectedUserForKyc._id, selectedUserForKyc.name)}
                className="rounded-xl text-xs font-bold h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                Approve & Issue APMC Clearance 🟢
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
