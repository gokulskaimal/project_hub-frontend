import Link from 'next/link'


export default function Header() {

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
                            <span className="text-sm font-bold text-white">PH</span>
                        </div>
                        <Link href='/'><span className="text-lg font-bold text-gray-900">Project Hub</span></Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Features</a>
                        <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Integrations</a>
                        <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Pricing</a>
                        <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Big Picture</a>
                        <a className="text-sm text-gray-600 hover:text-gray-900" href="#">Customers</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link className="text-sm text-gray-600 hover:text-gray-900" href="/login">Sign in</Link>
                        <Link href='/signup'><button className="h-9 rounded-lg bg-blue-600 px-3 text-sm text-white shadow-sm hover:bg-blue-700">
                            Get Started
                        </button></Link>
                    </div>
                </div>
            </div>
        </header>)
}
