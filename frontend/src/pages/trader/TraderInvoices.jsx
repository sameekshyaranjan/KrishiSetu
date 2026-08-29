import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Search, 
  RefreshCw, 
  QrCode, 
  ExternalLink, 
  X,
  Layers,
  Sparkles
} from 'lucide-react'

const DEMO_INVOICES = [
  {
    _id: 'INV-KA-2026-9912',
    orderId: 'ORD-KA-TRD-9912',
    date: '28 Aug 2026',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    variety: 'Shiva Hybrid (Firm Red Skin)',
    hsnCode: '07020000',
    quantity: 120,
    unit: 'Quintals',
    unitRate: 2200,
    baseAmount: 264000,
    apmcCess: 3960, // 1.5%
    ruralCess: 1320, // 0.5%
    freightAmount: 3200,
    totalAmount: 272480,
    amountInWords: 'Two Lakh Seventy Two Thousand Four Hundred and Eighty Rupees Only',
    farmer: {
      name: 'Ramesh Gowda',
      village: 'Belur Village',
      district: 'Hassan',
      rtcNumber: 'RTC-HSN-88192',
      bankUtr: 'HDFCR52026082800441'
    },
    buyer: {
      entity: 'Karnataka Agro Traders Pvt Ltd',
      license: 'KA-BLR-TRD-2026',
      gstin: '29AABCK9921D1Z8',
      address: 'APMC Yard, Yeshwanthpur, Bengaluru - 560022'
    },
    status: 'Settled & Cess Paid',
    mandiYard: 'Hassan APMC Main Market Yard'
  },
  {
    _id: 'INV-KA-2026-7721',
    orderId: 'ORD-KA-TRD-7721',
    date: '26 Aug 2026',
    cropName: 'Yellow Dent Poultry Maize',
    variety: 'Kargil 900M Hybrid',
    hsnCode: '10059000',
    quantity: 300,
    unit: 'Quintals',
    unitRate: 2050,
    baseAmount: 615000,
    apmcCess: 9225,
    ruralCess: 3075,
    freightAmount: 4800,
    totalAmount: 632100,
    amountInWords: 'Six Lakh Thirty Two Thousand One Hundred Rupees Only',
    farmer: {
      name: 'Channappa Gowda',
      village: 'Doddaballapura',
      district: 'Bengaluru Rural',
      rtcNumber: 'RTC-BLR-44102',
      bankUtr: 'AXISR52026082600112'
    },
    buyer: {
      entity: 'Karnataka Agro Traders Pvt Ltd',
      license: 'KA-BLR-TRD-2026',
      gstin: '29AABCK9921D1Z8',
      address: 'APMC Yard, Yeshwanthpur, Bengaluru - 560022'
    },
    status: 'Settled & Cess Paid',
    mandiYard: 'Doddaballapura APMC Sub-Yard'
  },
  {
    _id: 'INV-KA-2026-5510',
    orderId: 'ORD-KA-TRD-5510',
    date: '24 Aug 2026',
    cropName: 'Organic Finger Millet (Ragi)',
    variety: 'ML-365 High-Calcium Grain',
    hsnCode: '10082900',
    quantity: 150,
    unit: 'Quintals',
    unitRate: 3450,
    baseAmount: 517500,
    apmcCess: 7762,
    ruralCess: 2588,
    freightAmount: 3600,
    totalAmount: 531450,
    amountInWords: 'Five Lakh Thirty One Thousand Four Hundred and Fifty Rupees Only',
    farmer: {
      name: 'Venkatesh Murthy',
      village: 'Bangarapet',
      district: 'Kolar',
      rtcNumber: 'RTC-KLR-99214',
      bankUtr: 'HDFCR52026082400918'
    },
    buyer: {
      entity: 'Karnataka Agro Traders Pvt Ltd',
      license: 'KA-BLR-TRD-2026',
      gstin: '29AABCK9921D1Z8',
      address: 'APMC Yard, Yeshwanthpur, Bengaluru - 560022'
    },
    status: 'Settled & Cess Paid',
    mandiYard: 'Kolar APMC Market Yard'
  },
  {
    _id: 'INV-KA-2026-4410',
    orderId: 'ORD-KA-TRD-4410',
    date: '22 Aug 2026',
    cropName: 'Bellary Premium Red Onion',
    variety: 'Nasik Red Medium-Large Bulbs',
    hsnCode: '07031010',
    quantity: 250,
    unit: 'Quintals',
    unitRate: 2650,
    baseAmount: 662500,
    apmcCess: 9937,
    ruralCess: 3313,
    freightAmount: 5800,
    totalAmount: 681550,
    amountInWords: 'Six Lakh Eighty One Thousand Five Hundred and Fifty Rupees Only',
    farmer: {
      name: 'Basavaraj Patil',
      village: 'Malavalli',
      district: 'Mandya',
      rtcNumber: 'RTC-MND-33190',
      bankUtr: 'HDFCR52026082200114'
    },
    buyer: {
      entity: 'Karnataka Agro Traders Pvt Ltd',
      license: 'KA-BLR-TRD-2026',
      gstin: '29AABCK9921D1Z8',
      address: 'APMC Yard, Yeshwanthpur, Bengaluru - 560022'
    },
    status: 'Settled & Cess Paid',
    mandiYard: 'Mandya APMC Main Market Yard'
  }
]

export const TraderInvoices = () => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState(DEMO_INVOICES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Mandi e-invoices and statutory tax ledger synchronized!')
    }, 600)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadInvoice = (inv) => {
    if (!inv) return
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${inv._id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; }
          .total-box { margin-top: 20px; float: right; width: 320px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .grand-total { font-weight: bold; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 8px; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h3 style="margin:0; color:#d97706;">GOVERNMENT OF KARNATAKA • DEPARTMENT OF AGRICULTURAL MARKETING</h3>
          <h2 style="margin:6px 0;">ELECTRONIC MANDI TAX INVOICE & BILL OF SUPPLY</h2>
          <p style="margin:0; font-size:12px;">Issued under Section 65 of Karnataka APMC Act</p>
        </div>
        <div class="grid">
          <div>
            <strong>INVOICE NO:</strong> ${inv._id}<br/>
            <strong>DATE:</strong> ${inv.date}<br/>
            <strong>MANDI YARD:</strong> ${inv.mandiYard}<br/>
            <strong>BANK UTR:</strong> ${inv.farmer.bankUtr}
          </div>
          <div>
            <strong>CONSIGNEE (BUYER):</strong> ${inv.buyer.entity}<br/>
            <strong>APMC LICENSE:</strong> ${inv.buyer.license}<br/>
            <strong>GSTIN:</strong> ${inv.buyer.gstin}<br/>
            <strong>ADDRESS:</strong> ${inv.buyer.address}
          </div>
        </div>
        <div style="margin-bottom:20px; font-size:13px;">
          <strong>CONSIGNOR (PRODUCER):</strong> ${inv.farmer.name} (${inv.farmer.village}, ${inv.farmer.district})<br/>
          <strong>RTC LAND PARCEL:</strong> ${inv.farmer.rtcNumber}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Commodity Description</th>
              <th>HSN Code</th>
              <th>Quantity</th>
              <th>Rate (₹/Qtl)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${inv.cropName} (${inv.variety})</td>
              <td>${inv.hsnCode}</td>
              <td>${inv.quantity} ${inv.unit}</td>
              <td>₹${inv.unitRate.toLocaleString('en-IN')}</td>
              <td>₹${inv.baseAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div class="total-box">
          <div class="total-row"><span>Base Produce Value:</span> <span>₹${inv.baseAmount.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>APMC Cess (1.5%):</span> <span>₹${inv.apmcCess.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>Rural Dev Cess (0.5%):</span> <span>₹${inv.ruralCess.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>Logistics Freight:</span> <span>₹${inv.freightAmount.toLocaleString('en-IN')}</span></div>
          <div class="total-row grand-total"><span>Total Invoice Value:</span> <span>₹${inv.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>
        <div style="clear:both; padding-top:40px;">
          <p><strong>Amount in Words:</strong> ${inv.amountInWords}</p>
          <p style="font-size:11px; color:#64748b; margin-top:30px;">Digitally signed & verified by KrishiSetu APMC Settlement Vault.</p>
        </div>
      </body>
      </html>
    `
    const blob = new Blob([invoiceHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `APMC-Tax-Invoice-${inv._id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Official invoice ${inv._id} downloaded successfully!`)
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase()
      return (
        inv._id.toLowerCase().includes(q) ||
        inv.cropName.toLowerCase().includes(q) ||
        inv.farmer.name.toLowerCase().includes(q) ||
        inv.farmer.district.toLowerCase().includes(q)
      )
    })
  }, [invoices, searchQuery])

  // Aggregate Metrics
  const totalProcurement = invoices.reduce((acc, i) => acc + i.baseAmount, 0)
  const totalCess = invoices.reduce((acc, i) => acc + i.apmcCess + i.ruralCess, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt of Karnataka APMC Statutory e-Invoice System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Digital Mandi Invoices & Tax Ledger 📜
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Access cryptographically verified electronic APMC tax invoices, itemized market cess remittances, and printable GST bills of supply.
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
            Refresh Ledger
          </Button>

          <Button 
            onClick={() => toast.success('FY 2026-27 APMC Cess Statement exported to Excel!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export FY Summary
          </Button>
        </div>
      </div>

      {/* 2. 4 Fiscal & Compliance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Mandi Procurement</span>
          <p className="text-2xl font-black text-foreground">₹{totalProcurement.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">FY 2026–27 Direct Purchases</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">APMC Cess Remitted</span>
          <p className="text-2xl font-black text-emerald-600">₹{totalCess.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-bold">1.5% State Cess Settled</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Verified e-Invoices</span>
          <p className="text-2xl font-black text-primary">{invoices.length} Documents</p>
          <span className="text-[11px] text-muted-foreground">100% Tax Compliant</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Eligible Input Credit (ITC)</span>
          <p className="text-2xl font-black text-amber-600">₹{(totalProcurement * 0.05).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">GST R-2B Reconciled</span>
        </div>
      </div>

      {/* 3. Search & Invoices Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number, crop, or farmer..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <span className="text-xs text-muted-foreground font-semibold">
            Showing {filteredInvoices.length} Compliant Invoices
          </span>
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Invoice ID & Date</th>
                  <th className="p-4">Commodity / HSN</th>
                  <th className="p-4">Producer (Consignor)</th>
                  <th className="p-4">Base Taxable</th>
                  <th className="p-4">APMC Cess (1.5%)</th>
                  <th className="p-4 text-right">Gross Total (₹)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-[11px] text-primary block">{inv._id}</span>
                      <span className="text-[10px] text-muted-foreground">{inv.date}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-foreground">{inv.cropName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">HSN: {inv.hsnCode} • {inv.quantity} {inv.unit}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-foreground">{inv.farmer.name}</p>
                      <span className="text-[10px] text-muted-foreground">{inv.farmer.village}, {inv.farmer.district}</span>
                    </td>

                    <td className="p-4 font-mono font-bold text-foreground">
                      ₹{inv.baseAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-mono text-emerald-600 font-bold">
                      ₹{inv.apmcCess.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-right font-black text-sm text-foreground font-mono">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedInvoice(inv)}
                        className="rounded-xl text-xs h-8 px-3 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-amber-600" /> View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Full-Screen Official Mandi Tax e-Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Official Electronic Mandi Tax Invoice</h3>
                  <span className="text-[10px] font-mono text-muted-foreground">Original Copy for Consignee (Buyer)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="rounded-xl text-xs h-9 font-bold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-primary" /> Download Invoice
                </Button>

                <Button 
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
                </Button>

                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formatted Printable Invoice Template */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-6 text-xs font-sans">
              
              {/* Government APMC Top Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  Government of Karnataka • Department of Agricultural Marketing
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  ELECTRONIC MANDI TAX INVOICE & BILL OF SUPPLY
                </h2>
                <p className="text-[11px] text-slate-600">
                  Issued under Section 65 of Karnataka Agricultural Produce Marketing (Regulation & Development) Act
                </p>
              </div>

              {/* Invoice Meta & QR Code Grid */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">INVOICE NUMBER</span>
                  <p className="font-mono font-black text-sm text-slate-900">{selectedInvoice._id}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">DATE OF ISSUE</span>
                  <p className="font-bold text-slate-900">{selectedInvoice.date}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">APMC JURISDICTION</span>
                  <p className="font-bold text-slate-900">{selectedInvoice.mandiYard}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">PAYMENT UTR</span>
                  <p className="font-mono font-bold text-[11px] text-emerald-700">{selectedInvoice.farmer.bankUtr}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-500 pt-1">APMC Digital Stamp</span>
                </div>
              </div>

              {/* Buyer & Seller Dual Column */}
              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4">
                {/* Consignor (Farmer) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">CONSIGNOR (PRODUCER / SELLER)</span>
                  <p className="font-black text-sm text-slate-900">{selectedInvoice.farmer.name}</p>
                  <p className="text-slate-600">{selectedInvoice.farmer.village}, {selectedInvoice.farmer.district}, Karnataka</p>
                  <p className="font-mono text-[11px] text-slate-600">Land RTC Parcel: {selectedInvoice.farmer.rtcNumber}</p>
                </div>

                {/* Consignee (Trader) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider">CONSIGNEE (LICENSED TRADER)</span>
                  <p className="font-black text-sm text-slate-900">{selectedInvoice.buyer.entity}</p>
                  <p className="text-slate-600">{selectedInvoice.buyer.address}</p>
                  <p className="font-mono text-[11px] text-slate-600">APMC License: {selectedInvoice.buyer.license} • GSTIN: {selectedInvoice.buyer.gstin}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Commodity Description</th>
                      <th className="p-2.5">HSN Code</th>
                      <th className="p-2.5 text-right">Quantity</th>
                      <th className="p-2.5 text-right">Rate (₹/Qtl)</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2.5">1</td>
                      <td className="p-2.5 font-sans font-bold text-slate-900">{selectedInvoice.cropName} ({selectedInvoice.variety})</td>
                      <td className="p-2.5">{selectedInvoice.hsnCode}</td>
                      <td className="p-2.5 text-right">{selectedInvoice.quantity} Qtl</td>
                      <td className="p-2.5 text-right">₹{selectedInvoice.unitRate.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold">₹{selectedInvoice.baseAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Tax Computation Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Produce Value:</span>
                      <span>₹{selectedInvoice.baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>APMC Market Cess (1.5%):</span>
                      <span>₹{selectedInvoice.apmcCess.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rural Development Cess (0.5%):</span>
                      <span>₹{selectedInvoice.ruralCess.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Farm-Gate Freight:</span>
                      <span>₹{selectedInvoice.freightAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>Total Invoice Value:</span>
                      <span>₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount In Words & Signatures */}
              <div className="pt-2 border-t border-slate-200 space-y-4">
                <p className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900">Amount in Words: </span>
                  {selectedInvoice.amountInWords}
                </p>

                <div className="flex justify-between items-end pt-6 text-[10px] text-slate-500 font-mono">
                  <div>
                    <p className="font-bold text-slate-800">KrishiSetu Escrow Settlement Engine</p>
                    <p>Cryptographically Signed via Karnataka Mandi Gateway</p>
                  </div>

                  <div className="text-right">
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <p className="font-bold text-slate-800">Authorized APMC Officer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderInvoices
