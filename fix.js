const fs = require('fs');
let s = fs.readFileSync('app/dashboard/profile/page.jsx', 'utf8');
s = s.replace('{(profile?.name) || ""}', '{profile && profile.name ? profile.name : ""}');
fs.writeFileSync('app/dashboard/profile/page.jsx', s);
