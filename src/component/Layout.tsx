import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, BarChart3, TrendingUp, ChevronRight } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/banks', icon: Building2, label: 'Banks' },
  { to: '/status', icon: TrendingUp, label: 'Financial Status' },
  { to: '/chart', icon: BarChart3, label: 'Financial Chart' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">₿</div>
          <span className="text-xl font-bold text-gray-800">FinTrack</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}