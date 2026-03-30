import React from 'react';

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-16 bg-gray-50/40 border-b">
            <div className="container max-w-4xl mx-auto px-8 text-center">
                <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-9">What customers say</div>
                <blockquote className="text-3xl font-semibold text-gray-900 leading-tight mb-4">“Project Hub transformed our productivity, making teamwork smarter and faster.”</blockquote>
                <cite className="text-sm text-gray-600">— Jane Doe, CTO at Innovate Labs</cite>
            </div>
        </section>
    );
}