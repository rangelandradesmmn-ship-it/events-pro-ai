const fs = require('fs');

let f = 'src/app/dashboard/layout.tsx';
let c = fs.readFileSync(f, 'utf-8');

c = c.replace(/import \{\s+Calendar,/g, "import { ShieldAlert,\n  Calendar,");
c = c.replace("const userRole = profile?.role || 'admin';", "const userRole = profile?.role || 'admin';\n  const isSuperadmin = profile?.is_superadmin || false;\n  const activeRoles = [userRole, ...(isSuperadmin ? ['superadmin'] : [])];");
c = c.replace(/const allNavItems = \[/g, "const allNavItems = [\n    { name: 'Sala de Comando', href: '/dashboard/super-admin', icon: ShieldAlert, roles: ['superadmin'] },");
c = c.replace(/const navItems = allNavItems\.filter\(item => item\.roles\.includes\(userRole\)\);/g, "const navItems = allNavItems.filter(item => item.roles.some(r => activeRoles.includes(r)));");
c = c.replace("<MobileNav userRole={userRole} />", "<MobileNav userRole={userRole} isSuperadmin={isSuperadmin} />");

fs.writeFileSync(f, c);

let f2 = 'src/components/dashboard/mobile-nav.tsx';
let c2 = fs.readFileSync(f2, 'utf-8');
c2 = c2.replace("export function MobileNav({ userRole }: { userRole: string }) {", "export function MobileNav({ userRole, isSuperadmin = false }: { userRole: string, isSuperadmin?: boolean }) {\n  const activeRoles = [userRole, ...(isSuperadmin ? ['superadmin'] : [])];");
c2 = c2.replace(/import \{\s+Menu,\s+Calendar,/g, "import { \n  Menu,\n  ShieldAlert,\n  Calendar,");
c2 = c2.replace(/const allNavItems = \[/g, "const allNavItems = [\n    { name: 'Sala de Comando', href: '/dashboard/super-admin', icon: ShieldAlert, roles: ['superadmin'] },");
c2 = c2.replace(/const navItems = allNavItems\.filter\(item => item\.roles\.includes\(userRole\)\);/g, "const navItems = allNavItems.filter(item => item.roles.some(r => activeRoles.includes(r)));");

fs.writeFileSync(f2, c2);
