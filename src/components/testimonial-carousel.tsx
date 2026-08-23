"use client";

import { useEffect, useState } from "react";

const testimonials = [
  ["The fit felt like it was made for me. I wore it from dinner to the dance floor and never wanted to change.", "Zara H. · Dhaka"],
  ["Every tiny detail was thoughtful. Noor made my Eid morning feel even more special.", "Maliha S. · Chattogram"],
  ["Beautiful tailoring, graceful colour, and the most lovely packaging. A real treasure.", "Nusrat A. · Sylhet"],
  ["The colour was even lovelier in person. It was the first thing everyone asked me about.", "Raiya A. · Rajshahi"],
  ["From the consultation to the final fit, every step felt personal and effortless.", "Fariha K. · Dhaka"],
  ["A timeless piece I know I will wear for years, and then pass down with love.", "Samiha R. · Khulna"],
  ["I felt beautifully myself all evening. The cut, the fabric, the small details—perfect.", "Tania M. · Sylhet"],
  ["The tailoring was impeccable and the team made everything feel so easy.", "Areeba N. · Chattogram"],
];

export function TestimonialCarousel() {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(testimonials.length / 3);
  useEffect(() => { const timer = window.setInterval(() => setPage(current => (current + 1) % pages), 3000); return () => window.clearInterval(timer); }, [pages]);
  const visible = Array.from({ length: 3 }, (_, index) => testimonials[(page * 3 + index) % testimonials.length]);
  return <><div className="mt-12 grid gap-4 md:grid-cols-3">{visible.map(([quote, name]) => <blockquote key={`${page}-${name}`} className="flex min-h-[285px] animate-[fade-in_.45s_ease-out] flex-col border border-line bg-[#fdfbf8] p-7"><span className="font-display text-4xl text-wine">“</span><p className="mt-3 font-display text-2xl leading-snug">{quote}</p><footer className="mt-auto pt-7 font-mono text-[10px] text-stone-500">{name}</footer></blockquote>)}</div><div className="mt-7 flex justify-center gap-2">{Array.from({ length: pages }, (_, index) => <button key={index} onClick={() => setPage(index)} aria-label={`Show testimonial group ${index + 1}`} className={`h-1.5 rounded-full transition-all ${page === index ? "w-8 bg-wine" : "w-1.5 bg-[#d7bfc0]"}`}/>)}</div></>;
}
