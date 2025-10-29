import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Dashboard } from './Dashboard'
import { RunDetails } from './RunDetails'
import { SearchDemo } from './SearchDemo'

export function AppRouter() {
  return (
    <div className="flex w-full min-h-screen bg-black">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/run/:id" element={<RunDetails />} />
        <Route path="/search-demo" element={<SearchDemo />} />
      </Routes>
    </div>
  )
}
