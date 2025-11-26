import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5] px-4 text-center">
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
             <span className="text-2xl font-bold text-blue-600">?</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}