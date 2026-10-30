const fs = require('fs');
let s = fs.readFileSync('app/(shop)/contact/page.jsx','utf8');
const start = s.indexOf('<PageHeader');
const end = s.indexOf('/>', start) + 2;
s = s.substring(0, start) + `<div class="rounded-2xl bg-gradient-to-b from-blue-50/60 to-surface p-6 sm:p-8 lg:p-10"><div class="max-w-2xl"><p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Contact / Support</p><h1 class="mt-2 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">We&apos;re here to help</h1><p class="mt-3 text-sm leading-6 text-on-surface-variant">Reach our UK and Pakistan offices for enquiries, support, or product questions.</p></div></div>` + s.substring(end);
fs.writeFileSync('app/(shop)/contact/page.jsx', s);
