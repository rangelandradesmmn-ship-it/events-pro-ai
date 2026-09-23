const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/suppliers/page.tsx', 'utf-8');
c = c.replace(/<Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>\s*<a href=\{`https:\/\/instagram\.com\/\$\{supplier\.instagram\.replace\('@', ''\)\}`\} target="_blank" rel="noreferrer">\s*<Camera className="mr-2 h-3 w-3" \/> Instagram\s*<\/a>\s*<\/Button>/g, 
`<a href={\`https://instagram.com/\${supplier.instagram.replace('@', '')}\`} target="_blank" rel="noreferrer" className="w-full">
  <Button variant="outline" size="sm" className="w-full text-xs h-8">
    <Camera className="mr-2 h-3 w-3" /> Instagram
  </Button>
</a>`);

c = c.replace(/<Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>\s*<a href=\{supplier\.portfolio_url\} target="_blank" rel="noreferrer">\s*<Globe className="mr-2 h-3 w-3" \/> Portflio\s*<\/a>\s*<\/Button>/g, 
`<a href={supplier.portfolio_url} target="_blank" rel="noreferrer" className="w-full">
  <Button variant="outline" size="sm" className="w-full text-xs h-8">
    <Globe className="mr-2 h-3 w-3" /> Portfólio
  </Button>
</a>`);

fs.writeFileSync('src/app/dashboard/suppliers/page.tsx', c);
