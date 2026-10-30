const { execSync } = require('child_process');
try { execSync('git show HEAD:app/(shop)/contact/page.jsx > /tmp/contact_new.backup', { cwd: 'C:\\Users\\H\\Desktop\\zoelit\\zoelit', stdio: 'inherit' }); } catch(e){ console.log('contact backup failed'); }
try { execSync('git show HEAD:app/(shop)/faq/page.jsx > /tmp/faq_new.backup', { cwd: 'C:\\Users\\H\\Desktop\\zoelit\\zoelit', stdio: 'inherit' }); } catch(e){ console.log('faq backup failed'); }
