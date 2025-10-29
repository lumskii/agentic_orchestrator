import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render without Router during SSR
  if (!isClient) {
    return <Component {...pageProps} />
  }

  // Render with Router only on client side
  return (
    <Router>
      <Component {...pageProps} />
    </Router>
  )
}
