import useAuth from '@/hooks/useAuth'
import { ShieldCheck, Users, BookOpen, FileText } from 'lucide-react'

export const AdminDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          System Administration Console 🛡️
        </h1>
        <p className="text-muted-foreground text-xs">
          Logged in as {user?.email || 'admin@krishisetu.in'}. Monitor platform metrics, audit logs, and KYC reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">1,240</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending KYC</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500">8 Requests</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Schemes</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">14 Schemes</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground text-xs">
        🛡️ Admin Analytics & KYC Approval Workflow will be built in Stage 140-150.
      </div>
    </div>
  )
}

export default AdminDashboard
