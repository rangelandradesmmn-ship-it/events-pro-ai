const fs = require('fs');

let f = 'src/app/portal/[token]/layout.tsx';
let c = fs.readFileSync(f, 'utf-8');

c = c.replace(
  /<span className="font-serif font-bold text-xl text-gold-400 tracking-wide">LUXE EVENTS<\/span>/g,
  `{agencyProfile?.agency_logo_url ? (
                <img src={agencyProfile.agency_logo_url} alt={agencyName} className="h-10 object-contain" />
              ) : (
                <span className="font-serif font-bold text-xl tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
              )}`
);

c = c.replace(
  /<span className="font-serif font-bold text-gold-400 tracking-wide">LUXE EVENTS<\/span>/g,
  `{agencyProfile?.agency_logo_url ? (
                <img src={agencyProfile.agency_logo_url} alt={agencyName} className="h-6 object-contain" />
              ) : (
                <span className="font-serif font-bold tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
              )}`
);

fs.writeFileSync(f, c);
