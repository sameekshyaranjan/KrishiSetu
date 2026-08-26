import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="text-6xl font-extrabold text-primary">404</div>
      <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="text-muted-foreground text-xs max-w-sm">
        The requested page does not exist or has been relocated to another section of KrishiSetu.
      </p>
      <Button asChild size="sm" className="rounded-xl shadow">
        <Link to="/">
          <Home className="w-4 h-4 mr-2" /> Return to Home
        </Link>
      </Button>
    </div>
  )
}

export default NotFound
