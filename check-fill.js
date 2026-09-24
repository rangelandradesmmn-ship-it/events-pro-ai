const fs = require('fs');
const content = fs.readFileSync('src/app/portal/[token]/tables/page.tsx', 'utf8');
const m = content.match(/fill="n(.*?)"/);
console.log(m ? m[0] : 'not found');
