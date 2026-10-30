const fs = require('fs');
const replacements = [
  { f: 'app/(shop)/products/[id]/page.jsx', s: 'font-heading text-headline-md font-extrabold', r: 'font-heading text-3xl font-extrabold' },
  { f: 'app/(shop)/products/[id]/product-buy.jsx', s: 'font-heading text-headline-lg font-extrabold', r: 'font-heading text-3xl font-extrabold' },
];
for (const item of replacements) {
  try {
    let s = fs.readFileSync(item.f, 'utf8');
    s = s.replace(item.s, item.r);
    fs.writeFileSync(item.f, s);
  } catch (e) {}
}
