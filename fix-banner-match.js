const fs = require('fs');
// Contact banner to match store light card style
let c = fs.readFileSync('app/(shop)/contact/page.jsx','utf8');
c = c.replace('rounded-2xl bg-gradient-to-b from-blue-50/60 to-surface p-6 sm:p-8 lg:p-10', 'rounded-xl border border-outline-variant/60 bg-surface-container-low/40 p-4 sm:p-6 shadow-sm');
c = c.replace('text-blue-600', 'text-primary');
fs.writeFileSync('app/(shop)/contact/page.jsx', c);
// FAQ banner same
let f = fs.readFileSync('app/(shop)/faq/page.jsx','utf8');
f = f.replace('rounded-2xl bg-gradient-to-b from-surface-container-low/80 to-surface p-6 sm:p-8 lg:p-10', 'rounded-xl border border-outline-variant/60 bg-surface-container-low/40 p-4 sm:p-6 shadow-sm');
fs.writeFileSync('app/(shop)/faq/page.jsx', f);
