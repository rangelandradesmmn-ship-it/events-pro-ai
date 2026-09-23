const fs = require('fs');

function fix(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content);
}

// 1. Register Page
fix('src/app/register/page.tsx', [
  ['/logo.jpg', '/logo.png'],
  ['mix-blend-multiply', '']
]);

// 2. Login Page
fix('src/app/login/page.tsx', [
  ['/logo.jpg', '/logo.png'],
  ['mix-blend-multiply', '']
]);

// 3. Dashboard Layout (Desktop and Mobile Header)
fix('src/app/dashboard/layout.tsx', [
  ['/logo.jpg', '/logo.png'],
  ['className="h-12 object-contain"', 'className="w-full h-16 object-contain"'], // Make desktop bigger
  ['/logo.jpg', '/logo.png'], // for mobile header
  ['className="h-8 object-contain mix-blend-multiply mr-10"', 'className="h-10 object-contain mr-8"'] // Make mobile bigger and remove blend
]);

// 4. Mobile Nav Component (Inside the drawer)
fix('src/components/dashboard/mobile-nav.tsx', [
  ['/logo.jpg', '/logo.png'],
  ['className="h-10 object-contain"', 'className="w-full h-12 object-contain"']
]);
