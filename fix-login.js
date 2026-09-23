const fs = require('fs');
let c = fs.readFileSync('src/app/login/page.tsx', 'utf-8');
c = c.replace(/<blockquote className="space-y-2">[\s\S]*?<\/blockquote>/, `<blockquote className="space-y-2">
            <p className="text-xl text-gold-100 font-light tracking-wide leading-relaxed">
              "TECNOLOGIA QUE VALORIZA O SEU TALENTO"
            </p>
            <footer className="text-sm text-gold-400/80 uppercase tracking-widest">
              Events Pro AI
            </footer>
          </blockquote>`);
fs.writeFileSync('src/app/login/page.tsx', c);
