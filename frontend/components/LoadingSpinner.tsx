import React from 'react'
import { Loader as LoaderIcon } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LoaderIcon 
        className={`text-[#00B8D9] animate-spin ${sizeClasses[size]}`} 
        size={iconSizes[size]} 
      />
      {text && (
        <p className="text-zinc-400 mt-2 text-sm">{text}</p>
      )}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function TableLoader({ text = 'Loading data...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}