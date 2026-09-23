const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/utils/supabase/server')) {
        content = content.replace(/import \{ createClient \} from '@\/utils\/supabase\/server';/g, "import { createAdminClient as createClient } from '@/utils/supabase/admin';");
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('src/app/portal');
replaceInDir('src/app/invite');
console.log('Replaced createClient with createAdminClient in public routes.');
