const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/portal')
  .concat(walk('src/components/portal'))
  .concat(walk('src/app/dashboard/ceremony-3d'))
  .concat(walk('src/components/3d'));

const replacements = {
  'nǜo': 'não',
  'VocǦ': 'Você',
  'vocǦ': 'você',
  'cerimnia': 'cerimônia',
  'jǭ': 'já',
  'estǭ': 'está',
  'Confirmaes': 'Confirmações',
  'presena': 'presença',
  'estarǜo': 'estarão',
  'Organizao': 'Organização',
  'disposio': 'disposição',
  'Ningum': 'Ninguém',
  'Visǜo': 'Visão',
  'construǜo': 'construção',
  'no': 'não',
  'Cerimnia': 'Cerimônia',
  'pǭgina': 'página',
  'CerimÃ´nia': 'Cerimônia',
  'VocÃª': 'Você',
  'nÃ£o': 'não',
  'jÃ¡': 'já',
  'estÃ¡': 'está',
  'vocÃª': 'você',
  'informaÃ§Ã£o': 'informação',
  'atÃ©': 'até',
  'â€”': '—',
  'confirmaes': 'confirmações',
  'presena': 'presença'
};

let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  // Extra replacement for the 'no' false positive
  // Wait, replacing "no" globally is dangerous because it matches the word "no" (e.g. "no portal")
  // Let's replace ONLY "ainda no publicou" -> "ainda não publicou"
  content = content.replace(/ainda no publicou/g, 'ainda não publicou');
  
  // Revert isolated 'não' if we broke 'no'
  content = content.replace(/<span className="text-sm font-medium text-zinc-500">não portal/g, '<span className="text-sm font-medium text-zinc-500">no portal');
  content = content.replace(/Publicar não Portal/g, 'Publicar no Portal');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
    filesChanged++;
  }
});

console.log('Done! Changed ' + filesChanged + ' files.');
