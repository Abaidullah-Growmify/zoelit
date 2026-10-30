const fs = require('fs');
let s = fs.readFileSync('app/(shop)/faq/page.jsx', 'utf8');

// Remove last FAQ (last object before closing bracket of array)
s = s.replace(/  \{ question: "Will I receive confirmation after contacting ZoeLit\?", answer: "Yes\. Your message is saved securely and you receive a reference number by email\. The support team is also notified for follow-up\." \},\n\];/, '  ];');

// Shorten support topic texts
s = s.replace('Find products, compare options, and check SKU availability.', 'Find products, compare, check SKU.');
s = s.replace('Get help with order status, delivery, returns, and tracking.', 'Order status, delivery, tracking help.');
s = s.replace('Manage your profile, addresses, wishlist, and sign-in access.', 'Profile, addresses, wishlist, sign-in.');

// Shorten banner description
s = s.replace('Clear answers about products, orders, checkout, accounts, and support.', 'Clear answers about products, orders, accounts, support.');

// Shorten CTA card text
s = s.replace('Our support team can help with products, orders, delivery, returns, and business enquiries.', 'We help with products, orders, delivery, accounts.');

fs.writeFileSync('app/(shop)/faq/page.jsx', s);
