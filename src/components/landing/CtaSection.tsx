
export default function CtaSection() {
    return (
    <section id="cta" className="py-20 bg-gradient-to-b from-transparent to-[#2463EB]/5">
        <div className="container max-w-[1400px] mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to transform the way your team works?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">Sign up free to get started in minutes.</p>
            <div className="flex items-center justify-center gap-3">
                <a href="/signup" className="rounded-lg bg-[#2463EB] px-8 py-3 text-white font-medium hover:bg-[#2463EB]/90">Sign Up Free</a>
                <a href="#" className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-gray-900 font-medium hover:bg-gray-50">Request Demo</a>
            </div>
        </div>
    </section> 
);
}