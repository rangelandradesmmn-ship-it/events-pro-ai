const fs = require('fs');

let f = 'src/app/dashboard/billing/page.tsx';
let c = fs.readFileSync(f, 'utf-8');
c = c.replace(
  "<span className=\"text-5xl font-black\">R$ 97</span>",
  "<span className=\"text-5xl font-black\">R$ 59,90</span>"
);
fs.writeFileSync(f, c);

console.log('Fixed Price UI.');
