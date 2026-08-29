/**
 * KrishiSetu High-Volume Data Export Engine
 * Generates RFC-4180 compliant CSV with UTF-8 BOM for Microsoft Excel / Google Sheets compatibility.
 */

export const exportService = {
  /**
   * Universal CSV Exporter
   * @param {string} filename - Base filename without extension
   * @param {Array<Object>} data - Array of row objects
   * @param {Array<{key: string, label: string}>} columns - Column definition mapping
   */
  exportToCSV: (filename, data, columns) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export')
    }

    const headers = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')
    
    const rows = data.map((item) => {
      return columns
        .map((c) => {
          let val = item[c.key]
          if (val === null || val === undefined) val = ''
          if (typeof val === 'object') val = JSON.stringify(val)
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    })

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  /**
   * Universal JSON Exporter
   */
  exportToJSON: (filename, data) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  /**
   * Export Statutory Cess Treasury Ledger
   */
  exportCessLedger: (audits) => {
    const cols = [
      { key: '_id', label: 'Cess Record ID' },
      { key: 'mandiYard', label: 'APMC Market Yard' },
      { key: 'commodity', label: 'Commodity' },
      { key: 'tradeValue', label: 'Gross Trade Value (INR)' },
      { key: 'cessAmount', label: '1.5% APMC Cess (INR)' },
      { key: 'traderName', label: 'Wholesale Buyer' },
      { key: 'traderGstin', label: 'Buyer GSTIN' },
      { key: 'farmerName', label: 'Farmer Name' },
      { key: 'remittanceStatus', label: 'Treasury Status' },
      { key: 'treasuryChallanNo', label: 'e-Challan Reference' },
      { key: 'collectedDate', label: 'Collection Timestamp' }
    ]
    exportService.exportToCSV('krishisetu_apmc_cess_treasury_ledger', audits, cols)
  },

  /**
   * Export Mandi Gate Pass Traffic Manifest
   */
  exportGateManifest: (passes) => {
    const cols = [
      { key: '_id', label: 'Gate Pass ID' },
      { key: 'mandiYard', label: 'Mandi Yard' },
      { key: 'vehicleNo', label: 'Truck Vehicle #' },
      { key: 'vehicleType', label: 'Vehicle Class' },
      { key: 'cropName', label: 'Produce Name' },
      { key: 'declaredBags', label: 'Declared Crates/Bags' },
      { key: 'grossWeightKg', label: 'Gross Weight (Kg)' },
      { key: 'tareWeightKg', label: 'Tare Weight (Kg)' },
      { key: 'netWeightQtl', label: 'Certified Net (Qtl)' },
      { key: 'farmerName', label: 'Farmer / Origin' },
      { key: 'driverName', label: 'Driver Name' },
      { key: 'status', label: 'Gate Clearance Status' },
      { key: 'timestamp', label: 'Entry Timestamp' }
    ]
    exportService.exportToCSV('krishisetu_apmc_gate_traffic_manifest', passes, cols)
  },

  /**
   * Export Security Forensics & Audit Trail
   */
  exportAuditLogs: (logs) => {
    const cols = [
      { key: '_id', label: 'Log Reference ID' },
      { key: 'category', label: 'Category' },
      { key: 'severity', label: 'Severity' },
      { key: 'event', label: 'Event Description' },
      { key: 'actor', label: 'Initiator Actor' },
      { key: 'actorRole', label: 'Actor Role' },
      { key: 'ipAddress', label: 'IP Address' },
      { key: 'targetResource', label: 'Target Entity' },
      { key: 'details', label: 'Forensic Details' },
      { key: 'hash', label: 'SHA-256 Hash' },
      { key: 'timestamp', label: 'Timestamp' }
    ]
    exportService.exportToCSV('krishisetu_security_audit_forensics', logs, cols)
  },

  /**
   * Export Registered Entity Registry
   */
  exportUserRegistry: (users) => {
    const cols = [
      { key: '_id', label: 'Entity ID' },
      { key: 'name', label: 'Name / Trade Firm' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Mobile Number' },
      { key: 'district', label: 'District' },
      { key: 'fruitsId', label: 'Karnataka FRUITS ID' },
      { key: 'gstin', label: 'Buyer GSTIN' },
      { key: 'apmcLicense', label: 'APMC License #' },
      { key: 'status', label: 'Account Status' },
      { key: 'kycVerified', label: 'KYC Verified' },
      { key: 'lifetimeTradeTurnover', label: 'Lifetime Turnover (INR)' },
      { key: 'joinedDate', label: 'Registration Date' }
    ]
    exportService.exportToCSV('krishisetu_registered_entities_registry', users, cols)
  }
}

export default exportService
