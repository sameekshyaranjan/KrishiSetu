import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Centralized Public Navigation Bar */}
      <Navbar />

      {/* Main Public Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Centralized Public Footer */}
      <Footer />
    </div>
  )
}

export default PublicLayout
