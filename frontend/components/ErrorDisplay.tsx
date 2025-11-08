import React from 'react'
import { 
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  RefreshCw as RefreshIcon 
} from 'lucide-react'

interface ErrorDisplayProps {
  title?: string
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
  className?: string
}

export function ErrorDisplay({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onGoBack,
  className = ''
}: ErrorDisplayProps) {
  return (
    <div className={`text-center ${className}`}>
      <AlertCircleIcon className="text-red-500 mx-auto mb-4" size={48} />
      <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
      <p className="text-zinc-400 mb-6">{message}</p>
      
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#00B8D9] text-white rounded-lg hover:bg-[#00a5c3] transition-colors"
          >
            <RefreshIcon size={18} />
            Try Again
          </button>
        )}
        
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
          >
            <ArrowLeftIcon size={18} />
            Go Back
          </button>
        )}
      </div>
    </div>
  )
}

export function PageError({ 
  title,
  message,
  onRetry,
  onGoBack 
}: ErrorDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <ErrorDisplay 
        title={title}
        message={message}
        onRetry={onRetry}
        onGoBack={onGoBack}
      />
    </div>
  )
}

export function InlineError({ 
  title,
  message,
  onRetry 
}: Pick<ErrorDisplayProps, 'title' | 'message' | 'onRetry'>) {
  return (
    <div className="py-8 px-4">
      <ErrorDisplay 
        title={title}
        message={message}
        onRetry={onRetry}
        className="max-w-md mx-auto"
      />
    </div>
  )
}