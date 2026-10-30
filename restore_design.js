const fs = require('fs');
// Restore contact page banner and layout exactly as redesigned
let c = fs.readFileSync('app/(shop)/contact/page.jsx', 'utf8');
// Make sure banner heading is large (if it was shrunk back)
c = c.replace('className="font-heading text-2xl font-bold text-on-surface"', 'className="font-heading text-3xl font-bold text-on-surface sm:text-4xl"');
fs.writeFileSync('app/(shop)/contact/page.jsx', c);

// Restore FAQ page banner + 3 sections + bottom CTA exactly
let f = fs.readFileSync('app/(shop)/faq/page.jsx', 'utf8');
f = f.replace('Banner description short', 'Clear answers about products, orders, checkout, accounts, and support.'); // placeholder if needed
// Ensure banner heading is large
f = f.replace('text-2xl font-bold text-on-surface sm:text-3xl', 'text-3xl font-extrabold text-on-surface sm:text-4xl');
fs.writeFileSync('app/(shop)/faq/page.jsx', f);
console.log('Restored designed versions');
