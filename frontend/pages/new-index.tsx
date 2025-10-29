import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Dashboard } from './Dashboard'
import { RunDetails } from './RunDetails'
import { SearchDemo } from './SearchDemo'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Agentic Orchestrator - Tiger Cloud Challenge</title>
        <meta name="description" content="Multi-agent orchestration for Agentic Postgres" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex w-full min-h-screen bg-black">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/run/:id" element={<RunDetails />} />
          <Route path="/search-demo" element={<SearchDemo />} />
        </Routes>
      </div>
    </>
  )
}
