import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard as LayoutDashboardIcon,
  Activity as ActivityIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from 'lucide-react'

export function Sidebar() {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      icon: LayoutDashboardIcon,
      label: 'Dashboard',
    },
    {
      path: '/search-demo',
      icon: SearchIcon,
      label: 'Search Demo',
    },
    {
      path: '/settings',
      icon: SettingsIcon,
      label: 'Settings',
    },
  ]

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-screen flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h1 className="text-white font-semibold text-lg">Agentic</h1>
            <p className="text-zinc-500 text-sm">Orchestrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive ? 'bg-[#00B8D9] text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B8D9] to-blue-500" />
          <div>
            <p className="text-white text-sm font-medium">Demo User</p>
            <p className="text-zinc-500 text-xs">demo@agentic.dev</p>
          </div>
        </div>
      </div>
    </div>
  )
}
