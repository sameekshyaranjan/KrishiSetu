import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/common/ProtectedRoute'

// Layouts
import PublicLayout from '@/components/common/PublicLayout'
import FarmerLayout from '@/components/farmer/FarmerLayout'
import TraderLayout from '@/components/trader/TraderLayout'
import AdminLayout from '@/components/admin/AdminLayout'

// Pages
import Home from '@/pages/public/Home'
import MandiPrices from '@/pages/public/MandiPrices'
import Schemes from '@/pages/public/Schemes'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import FarmerRegister from '@/pages/auth/FarmerRegister'
import TraderRegister from '@/pages/auth/TraderRegister'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import FarmerListings from '@/pages/farmer/FarmerListings'
import FarmerBids from '@/pages/farmer/FarmerBids'
import FarmerOrders from '@/pages/farmer/FarmerOrders'
import FarmerWeather from '@/pages/farmer/FarmerWeather'
import FarmerProfile from '@/pages/farmer/FarmerProfile'
import FarmerNotifications from '@/pages/farmer/FarmerNotifications'
import TraderDashboard from '@/pages/trader/TraderDashboard'
import TraderMarketplace from '@/pages/trader/TraderMarketplace'
import TraderCropDetails from '@/pages/trader/TraderCropDetails'
import TraderBids from '@/pages/trader/TraderBids'
import TraderEscrow from '@/pages/trader/TraderEscrow'
import TraderOrders from '@/pages/trader/TraderOrders'
import TraderInvoices from '@/pages/trader/TraderInvoices'
import TraderProfile from '@/pages/trader/TraderProfile'
import TraderNotifications from '@/pages/trader/TraderNotifications'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminSchemes from '@/pages/admin/AdminSchemes'
import AdminCessAudits from '@/pages/admin/AdminCessAudits'
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs'
import AdminMandiMonitoring from '@/pages/admin/AdminMandiMonitoring'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminDisputes from '@/pages/admin/AdminDisputes'
import AdminPriceIntelligence from '@/pages/admin/AdminPriceIntelligence'
import NotFound from '@/pages/public/NotFound'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/mandi-prices" element={<MandiPrices />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/farmer" element={<FarmerRegister />} />
        <Route path="/register/trader" element={<TraderRegister />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Protected Farmer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
        <Route path="/farmer" element={<FarmerLayout />}>
          <Route index element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="listings" element={<FarmerListings />} />
          <Route path="my-crops" element={<FarmerListings />} />
          <Route path="add-crop" element={<FarmerListings />} />
          <Route path="bids" element={<FarmerBids />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="weather" element={<FarmerWeather />} />
          <Route path="profile" element={<FarmerProfile />} />
          <Route path="notifications" element={<FarmerNotifications />} />
        </Route>
      </Route>

      {/* 3. Protected Trader Routes */}
      <Route element={<ProtectedRoute allowedRoles={['trader']} />}>
        <Route path="/trader" element={<TraderLayout />}>
          <Route index element={<Navigate to="/trader/dashboard" replace />} />
          <Route path="dashboard" element={<TraderDashboard />} />
          <Route path="marketplace" element={<TraderMarketplace />} />
          <Route path="crops/:id" element={<TraderCropDetails />} />
          <Route path="my-bids" element={<TraderBids />} />
          <Route path="escrow" element={<TraderEscrow />} />
          <Route path="wallet" element={<TraderEscrow />} />
          <Route path="orders" element={<TraderOrders />} />
          <Route path="shipments" element={<TraderOrders />} />
          <Route path="invoices" element={<TraderInvoices />} />
          <Route path="profile" element={<TraderProfile />} />
          <Route path="notifications" element={<TraderNotifications />} />
          <Route path="alerts" element={<TraderNotifications />} />
        </Route>
      </Route>

      {/* 4. Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="schemes" element={<AdminSchemes />} />
          <Route path="cess-audits" element={<AdminCessAudits />} />
          <Route path="price-intelligence" element={<AdminPriceIntelligence />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="yard-monitoring" element={<AdminMandiMonitoring />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
