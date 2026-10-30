const fs = require('fs');
let s = fs.readFileSync('app/(shop)/faq/faq-accordion.jsx', 'utf8');
s = s.replace('className="flex w-full items-center gap-3 p-4 text-left sm:p-5"', 'className="flex w-full items-center gap-3 p-3 text-left sm:p-4"');
s = s.replace('font-heading text-base font-semibold text-on-surface sm:text-lg', 'font-heading text-sm font-semibold text-on-surface sm:text-base');
fs.writeFileSync('app/(shop)/faq/faq-accordion.jsx', s);
