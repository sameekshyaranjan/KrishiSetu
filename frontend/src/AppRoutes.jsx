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
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import TraderDashboard from '@/pages/trader/TraderDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import NotFound from '@/pages/public/NotFound'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/mandi-prices" element={<MandiPrices />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/farmer" element={<FarmerRegister />} />
        <Route path="/register/trader" element={<Register />} />
      </Route>

      {/* 2. Protected Farmer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
        <Route path="/farmer" element={<FarmerLayout />}>
          <Route index element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="add-crop" element={<FarmerDashboard />} />
          <Route path="my-crops" element={<FarmerDashboard />} />
        </Route>
      </Route>

      {/* 3. Protected Trader Routes */}
      <Route element={<ProtectedRoute allowedRoles={['trader']} />}>
        <Route path="/trader" element={<TraderLayout />}>
          <Route index element={<Navigate to="/trader/dashboard" replace />} />
          <Route path="dashboard" element={<TraderDashboard />} />
          <Route path="marketplace" element={<TraderDashboard />} />
          <Route path="my-bids" element={<TraderDashboard />} />
        </Route>
      </Route>

      {/* 4. Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="schemes" element={<AdminDashboard />} />
          <Route path="audit-logs" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 5. 404 Catch-All */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
