const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf-8');
c = c.replace(/<div className="bg-\[\#F9F0EE\][\s\S]*?<\/Link>/, `<img src="/logo.png" alt="Events Pro AI" className="h-8 object-contain" />
          </Link>`);
c = c.replace(/<Heart className="h-5 w-5 text-\[\#A86F6B\] fill-\[\#A86F6B\]" \/>\s*<span className="font-serif font-black tracking-wide text-lg">LUXE EVENTS<\/span>/, 
`<img src="/logo.png" alt="Events Pro AI" className="h-6 object-contain" />`);
fs.writeFileSync('src/app/dashboard/layout.tsx', c);
