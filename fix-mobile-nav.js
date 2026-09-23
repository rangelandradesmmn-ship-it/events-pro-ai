const fs = require('fs');

let f = 'src/app/dashboard/layout.tsx';
let c = fs.readFileSync(f, 'utf-8');

c = c.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { MobileNav } from '@/components/dashboard/mobile-nav';");

c = c.replace(/<header className="flex h-16 items-center gap-4 border-b border-zinc-100 bg-white px-4 lg:h-\[60px\] lg:px-6 \s*md:hidden">\s*<img src="\/logo\.jpg" alt="Events Pro AI" className="h-8 object-contain" \/>\s*<\/header>/, 
`<header className="flex h-16 items-center gap-4 border-b border-zinc-100 bg-white px-4 lg:h-[60px] lg:px-6 md:hidden">
            <MobileNav navItems={navItems} />
            <div className="flex-1 flex justify-center">
              <img src="/logo.jpg" alt="Events Pro AI" className="h-8 object-contain mix-blend-multiply mr-10" />
            </div>
          </header>`);

fs.writeFileSync(f, c);
