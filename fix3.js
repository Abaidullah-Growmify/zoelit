const fs = require('fs');
const files = [
  'app/(shop)/contact/page.jsx',
  'app/(shop)/faq/page.jsx',
  'app/(shop)/products/[id]/page.jsx',
  'app/(shop)/checkout/page.jsx'
];
for (const f of files) {
  try {
    let s = fs.readFileSync(f, 'utf8');
    s = s.replace(/text-2xl font-bold/g, 'text-3xl font-bold');
    s = s.replace(/sm:text-3xl/g, 'sm:text-4xl');
    s = s.replace(/text-xl font-bold/g, 'text-2xl font-bold');
    fs.writeFileSync(f, s);
  } catch (e) {}
}
