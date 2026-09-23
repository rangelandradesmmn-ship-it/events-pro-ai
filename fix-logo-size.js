const fs = require('fs');

let f = 'src/app/register/page.tsx';
let c = fs.readFileSync(f, 'utf-8');
c = c.replace('<img src="/logo.jpg" alt="Events Pro AI Logo" width="180" height="45" className="object-contain" />', 
'<img src="/logo.jpg" alt="Events Pro AI Logo" className="w-[420px] h-auto object-contain mix-blend-multiply" />');
fs.writeFileSync(f, c);

f = 'src/app/login/page.tsx';
c = fs.readFileSync(f, 'utf-8');
c = c.replace('<Image src="/logo.jpg" alt="Events Pro AI Logo" width={180} height={45} className="object-contain" />', 
'<img src="/logo.jpg" alt="Events Pro AI Logo" className="w-[350px] h-auto object-contain mix-blend-multiply -ml-4" />');
fs.writeFileSync(f, c);
