'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import Link from 'next/link'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error)
  }, [error])
 
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-lg md:min-w-[400px]">
        <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="mb-6 text-sm text-gray-500">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex flex-col gap-3">
            <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
            Try again
            </button>
            <Link href="/" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Go to Home
            </Link>
        </div>
      </div>
    </div>
  )
}