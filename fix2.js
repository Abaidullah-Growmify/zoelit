const fs = require('fs');
let s = fs.readFileSync('app/dashboard/profile/page.jsx', 'utf8');
s = s.replace('      <div className="flex items-center justify-between mb-4">\n        <div className={nameBadgeClass}>{profile && profile.name ? profile.name : ""}</div>\n        <DashboardSectionBanner eyebrow="Account / Settings" title={bannerTitle} description={bannerDescription} />\n      </div>', '      <DashboardSectionBanner eyebrow="Account / Settings" title={bannerTitle} description={bannerDescription} />');
fs.writeFileSync('app/dashboard/profile/page.jsx', s);
