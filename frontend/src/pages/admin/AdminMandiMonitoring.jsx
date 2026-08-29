import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Truck, 
  Scale, 
  Radio, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  QrCode, 
  X, 
  Printer, 
  Sparkles,
  Layers,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react'

const DEMO_GATE_PASSES = [
  {
    _id: 'GP-KA-YPR-2026-9912',
    timestamp: '5 mins ago (15:40 IST)',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    vehicleNo: 'KA-04-F-8812',
    vehicleType: '10-Wheel Heavy Eicher Truck',
    transporterName: 'Karnataka Agri-Express Logistics',
    driverName: 'Manjunath Swamy',
    driverMobile: '+91 98450 11223',
    farmerName: 'Ramesh Gowda (Belur, Hassan)',
    farmerRtc: 'RTC-HSN-88192',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    declaredBags: '480 Crates (120 Qtl)',
    grossWeightKg: 14280,
    tareWeightKg: 2280,
    netWeightKg: 12000,
    netWeightQtl: 120.0,
    weighbridgeTolerance: 'Passed (0.02% Variance)',
    shedAllocation: 'Auction Shed #4B (Vegetables)',
    status: 'unloading', // 'unloading' | 'cleared' | 'weighing'
    weighbridgeRef: 'WB-YPR-2026-8819'
  },
  {
    _id: 'GP-KA-BLR-2026-7721',
    timestamp: '22 mins ago (15:23 IST)',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    vehicleNo: 'KA-50-E-4419',
    vehicleType: '12-Wheel Tata Prima Commercial',
    transporterName: 'Deccan Grain Haulers Ltd',
    driverName: 'Shankar Rao',
    driverMobile: '+91 97412 88990',
    farmerName: 'Channappa Gowda (Doddaballapura)',
    farmerRtc: 'RTC-BLR-44102',
    cropName: 'Yellow Dent Poultry Maize',
    declaredBags: '600 Gunny Bags (300 Qtl)',
    grossWeightKg: 35850,
    tareWeightKg: 5850,
    netWeightKg: 30000,
    netWeightQtl: 300.0,
    weighbridgeTolerance: 'Passed (0.01% Variance)',
    shedAllocation: 'Grain Silo Shed #12',
    status: 'cleared',
    weighbridgeRef: 'WB-BLR-2026-7712'
  },
  {
    _id: 'GP-KA-KLR-2026-5510',
    timestamp: '40 mins ago (15:05 IST)',
    mandiYard: 'Kolar APMC Market Yard',
    vehicleNo: 'KA-07-C-3310',
    vehicleType: '6-Wheel Mahindra Bolero Maxi-Truck',
    transporterName: 'Kolar Fast-Freight Farmers Co-op',
    driverName: 'Anand Kumar',
    driverMobile: '+91 99001 22334',
    farmerName: 'Venkatesh Murthy (Bangarapet)',
    farmerRtc: 'RTC-KLR-99214',
    cropName: 'Organic Finger Millet (Ragi)',
    declaredBags: '300 Bags (150 Qtl)',
    grossWeightKg: 18450,
    tareWeightKg: 3450,
    netWeightKg: 15000,
    netWeightQtl: 150.0,
    weighbridgeTolerance: 'Passed (0.04% Variance)',
    shedAllocation: 'Millet Platform #2',
    status: 'cleared',
    weighbridgeRef: 'WB-KLR-2026-5510'
  },
  {
    _id: 'GP-KA-MND-2026-4410',
    timestamp: '1 hour ago (14:45 IST)',
    mandiYard: 'Mandya APMC Market Yard',
    vehicleNo: 'KA-11-M-9920',
    vehicleType: '10-Wheel Ashok Leyland Taurus',
    transporterName: 'Mandya District Logistics Union',
    driverName: 'Girish Gowda',
    driverMobile: '+91 98801 44556',
    farmerName: 'Basavaraj Patil (Malavalli)',
    farmerRtc: 'RTC-MND-33190',
    cropName: 'Bellary Premium Red Onion',
    declaredBags: '500 Mesh Sacks (250 Qtl)',
    grossWeightKg: 29750,
    tareWeightKg: 4750,
    netWeightKg: 25000,
    netWeightQtl: 250.0,
    weighbridgeTolerance: 'Passed (0.03% Variance)',
    shedAllocation: 'Onion Yard Platform #3',
    status: 'cleared',
    weighbridgeRef: 'WB-MND-2026-4410'
  },
  {
    _id: 'GP-KA-HSN-2026-1120',
    timestamp: 'Just now (15:44 IST)',
    mandiYard: 'Hassan APMC Market Yard',
    vehicleNo: 'KA-13-B-6621',
    vehicleType: '4-Wheel Tata 407 LCV',
    transporterName: 'Malnad Spices Logistics',
    driverName: 'Praveen Shetty',
    driverMobile: '+91 98440 66778',
    farmerName: 'Savitramma Gowda (Alur)',
    farmerRtc: 'RTC-HSN-11290',
    cropName: 'Malabar Green Cardamom',
    declaredBags: '80 Corrugated Boxes (40 Qtl)',
    grossWeightKg: 6850,
    tareWeightKg: 2850,
    netWeightKg: 4000,
    netWeightQtl: 40.0,
    weighbridgeTolerance: 'Calibrating Sensors...',
    shedAllocation: 'Specialty Spices Air-Conditioned Vault',
    status: 'weighing',
    weighbridgeRef: 'WB-HSN-2026-1120'
  }
]

const YARD_TABS = [
  { id: 'all', label: 'All Karnataka Yards' },
  { id: 'yeshwanthpur', label: 'Yeshwanthpur (Bengaluru)' },
  { id: 'hassan', label: 'Hassan APMC' },
  { id: 'mandya', label: 'Mandya APMC' },
  { id: 'kolar', label: 'Kolar APMC' }
]

export const AdminMandiMonitoring = () => {
  const { user } = useAuth()
  const [gatePasses, setGatePasses] = useState(DEMO_GATE_PASSES)
  const [selectedYard, setSelectedYard] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGatePass, setSelectedGatePass] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Live APMC weighbridge sensors & gate RFID streams synchronized!')
    }, 600)
  }

  const handleCalibrate = () => {
    toast.success('Legal Metrology digital sensor auto-zero calibration complete across all 5 yards! 🟢')
  }

  const handlePrint = () => {
    window.print()
  }

  // Filtered List
  const filteredGatePasses = useMemo(() => {
    return gatePasses.filter((gp) => {
      const matchesYard =
        selectedYard === 'all'
          ? true
          : selectedYard === 'yeshwanthpur'
          ? gp.mandiYard.toLowerCase().includes('yeshwanthpur')
          : selectedYard === 'hassan'
          ? gp.mandiYard.toLowerCase().includes('hassan')
          : selectedYard === 'mandya'
          ? gp.mandiYard.toLowerCase().includes('mandya')
          : selectedYard === 'kolar'
          ? gp.mandiYard.toLowerCase().includes('kolar')
          : true

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        gp._id.toLowerCase().includes(q) ||
        gp.vehicleNo.toLowerCase().includes(q) ||
        gp.transporterName.toLowerCase().includes(q) ||
        gp.cropName.toLowerCase().includes(q) ||
        gp.farmerName.toLowerCase().includes(q) ||
        gp.shedAllocation.toLowerCase().includes(q)

      return matchesYard && matchesSearch
    })
  }, [gatePasses, selectedYard, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-purple-600" />
            <span>Karnataka APMC Live Gate Telemetry & Weighbridge Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            State APMC Yard Telemetry & Gate Monitoring 🚛
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time digital weighbridge tare/gross validation, automated truck RFID gate clearance, and harvest shed allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCalibrate}
            className="rounded-xl text-xs h-10 shadow-sm border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" /> Calibrate Sensors
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stream
          </Button>

          <Button 
            onClick={() => toast.success('Daily Statewide APMC Gate Entry Manifest exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Gate Log
          </Button>
        </div>
      </div>

      {/* 2. 4 Gate & Yard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Active Market Yards</span>
          <p className="text-2xl font-black text-foreground">5 APMC Yards</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Sensors Online 🟢</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Daily Inbound Trucks</span>
          <p className="text-2xl font-black text-purple-600">142 Commercials</p>
          <span className="text-[11px] text-muted-foreground">RFID Cleared Today</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Net Commodity Inflow</span>
          <p className="text-2xl font-black text-emerald-600">18,450 Quintals</p>
          <span className="text-[11px] text-emerald-600 font-bold">Weighbridge Verified</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Sensor Tolerance Check</span>
          <p className="text-2xl font-black text-primary">0.02% Avg</p>
          <span className="text-[11px] text-primary font-bold">Legal Metrology Certified</span>
        </div>
      </div>

      {/* 3. Yard Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {YARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedYard(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedYard === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search truck number, gate pass, or crop..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Live Gate Entry Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Gate Pass & Time</th>
                  <th className="p-4">Truck & Transporter</th>
                  <th className="p-4">Commodity / Producer</th>
                  <th className="p-4">Gross / Tare / Net</th>
                  <th className="p-4">Shed & Bay</th>
                  <th className="p-4">Yard Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGatePasses.map((gp) => (
                  <tr key={gp._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-[11px] text-purple-600 block">{gp._id}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {gp.timestamp}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-foreground">{gp.vehicleNo}</p>
                      <span className="text-[10px] text-muted-foreground">{gp.transporterName}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-foreground">{gp.cropName}</p>
                      <span className="text-[10px] text-muted-foreground">{gp.farmerName} • {gp.declaredBags}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-mono font-black text-foreground">{gp.netWeightQtl} Qtl Net</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Gross: {gp.grossWeightKg}kg • Tare: {gp.tareWeightKg}kg
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[10px] font-bold text-foreground block w-fit">
                        {gp.shedAllocation}
                      </span>
                    </td>

                    <td className="p-4">
                      {gp.status === 'cleared' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Cleared 🟢
                        </span>
                      )}
                      {gp.status === 'unloading' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-bold border border-blue-500/20">
                          <Activity className="w-3 h-3 animate-spin" /> Unloading 🔵
                        </span>
                      )}
                      {gp.status === 'weighing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                          <Scale className="w-3 h-3 animate-pulse" /> On Scale 🟡
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGatePass(gp)}
                        className="rounded-xl text-xs h-8 px-2.5 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-purple-600" /> Weigh Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Full-Screen Digital Weighbridge Slip & Gate Pass Modal */}
      {selectedGatePass && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    APMC Electronic Weighbridge Slip & E-Gate Pass
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Legal Metrology Verified Automated Sensor Scale Certificate
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Weigh Slip
                </Button>

                <button 
                  onClick={() => setSelectedGatePass(null)}
                  className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Weighbridge Slip Template */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-6 text-xs font-sans">
              
              {/* Top Banner */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                  GOVERNMENT OF KARNATAKA • APMC YARD WEIGHBRIDGE DIVISION
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  ELECTRONIC WEIGHBRIDGE WEIGHT CERTIFICATE & GATE PASS
                </h2>
                <p className="text-[11px] text-slate-600">
                  Location: {selectedGatePass.mandiYard} • Weighbridge Ref: {selectedGatePass.weighbridgeRef}
                </p>
              </div>

              {/* Grid: Gate Pass Ref & QR Stamp */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">GATE PASS NUMBER</span>
                  <p className="font-mono font-black text-sm text-slate-900">{selectedGatePass._id}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">ARRIVAL TIMESTAMP</span>
                  <p className="font-bold text-slate-900">{selectedGatePass.timestamp}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">VEHICLE NUMBER</span>
                  <p className="font-mono font-black text-base text-purple-700">{selectedGatePass.vehicleNo}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">TRANSPORTER</span>
                  <p className="font-bold text-slate-900">{selectedGatePass.transporterName}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-500 pt-1">RFID Gate Pass Barcode</span>
                </div>
              </div>

              {/* Producer & Driver Coordinates */}
              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">PRODUCER / ORIGIN HARVEST</span>
                  <p className="font-black text-sm text-slate-900">{selectedGatePass.farmerName}</p>
                  <p className="font-mono text-[11px] text-slate-600">Land RTC: {selectedGatePass.farmerRtc}</p>
                  <p className="text-slate-600">Commodity: {selectedGatePass.cropName}</p>
                  <p className="text-slate-600 font-bold">Declared Packaging: {selectedGatePass.declaredBags}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">VEHICLE & DRIVER DISPATCH</span>
                  <p className="font-black text-sm text-slate-900">{selectedGatePass.driverName}</p>
                  <p className="font-mono text-[11px] text-slate-600">Phone: {selectedGatePass.driverMobile}</p>
                  <p className="text-slate-600">Vehicle Type: {selectedGatePass.vehicleType}</p>
                  <p className="text-slate-600 font-bold">Designated Shed: {selectedGatePass.shedAllocation}</p>
                </div>
              </div>

              {/* Electronic Weight Certificate Box */}
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-3 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-600 block text-center border-b border-slate-300 pb-1">
                  AUTOMATED DIGITAL LOAD-CELL READINGS (LEGAL METROLOGY ACT CERTIFIED)
                </span>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-bold">GROSS WEIGHT</span>
                    <p className="font-black text-base text-slate-900">{selectedGatePass.grossWeightKg.toLocaleString()} KG</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-bold">TRUCK TARE WEIGHT</span>
                    <p className="font-black text-base text-slate-900">{selectedGatePass.tareWeightKg.toLocaleString()} KG</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border-2 border-emerald-500">
                    <span className="text-[10px] text-emerald-800 block font-black">CERTIFIED NET WEIGHT</span>
                    <p className="font-black text-lg text-emerald-700">{selectedGatePass.netWeightQtl} QTL</p>
                    <span className="text-[9px] text-emerald-600 font-bold">({selectedGatePass.netWeightKg.toLocaleString()} KG)</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center pt-1">
                  Calibration Standard: Class-III Multi-Sensor Pitless Scale • {selectedGatePass.weighbridgeTolerance}
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500 font-mono">
                <div>
                  <p className="font-bold text-slate-800">KrishiSetu Mandi Gate Control</p>
                  <p>Electronically Verified via RFID Sensor Scanner</p>
                </div>

                <div className="text-right">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Mandi Weighbridge Officer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMandiMonitoring
