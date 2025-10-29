import React from 'react'
import { Plus as PlusIcon, Bell as BellIcon } from 'lucide-react'

interface NavbarProps {
  onNewRun?: () => void
}

export function Navbar({ onNewRun }: NavbarProps) {
  return (
    <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-white text-xl font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <BellIcon size={20} />
        </button>
        <button
          onClick={onNewRun}
          className="flex items-center gap-2 px-4 py-2 bg-[#00B8D9] text-white rounded-lg hover:bg-[#00a5c3] transition-colors font-medium"
        >
          <PlusIcon size={18} />
          New Run
        </button>
      </div>
    </div>
  )
}
