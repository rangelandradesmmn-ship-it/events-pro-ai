const fs = require('fs');

// Fix MobileNav signature
let f1 = 'src/components/dashboard/mobile-nav.tsx';
let c1 = fs.readFileSync(f1, 'utf-8');
c1 = c1.replace(
  'export function MobileNav({ userRole, isSuperadmin = false }: { userRole: string, isSuperadmin?: boolean }) {',
  'export function MobileNav({ userRole, isSuperadmin = false, userFullName, userEmail }: { userRole: string, isSuperadmin?: boolean, userFullName?: string, userEmail?: string }) {'
);
fs.writeFileSync(f1, c1);

// Fix auth callback NextResponse
let f2 = 'src/app/auth/callback/route.ts';
let c2 = fs.readFileSync(f2, 'utf-8');
c2 = c2.replace(
  "import { NextResponse } from 'next/navigation';",
  "import { NextResponse } from 'next/server';"
);
fs.writeFileSync(f2, c2);

// Fix stripe checkout
let f3 = 'src/app/api/stripe/checkout/route.ts';
let c3 = fs.readFileSync(f3, 'utf-8');
c3 = c3.replace(
  "import { NextResponse } from 'next/navigation';",
  "import { NextResponse } from 'next/server';"
);
c3 = c3.replace(
  "  apiVersion: '2025-02-24.acacia',",
  ""
);
fs.writeFileSync(f3, c3);

// Fix stripe webhook
let f4 = 'src/app/api/stripe/webhook/route.ts';
let c4 = fs.readFileSync(f4, 'utf-8');
c4 = c4.replace(
  "import { NextResponse } from 'next/navigation';",
  "import { NextResponse } from 'next/server';"
);
c4 = c4.replace(
  "  apiVersion: '2025-02-24.acacia',",
  ""
);
c4 = c4.replace(
  "const subscription = await stripe.subscriptions.retrieve(session.subscription as string);",
  "const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;"
);
c4 = c4.replace(
  "const subscription = await stripe.subscriptions.retrieve(session.subscription as string);",
  "const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;"
);
fs.writeFileSync(f4, c4);

console.log('Fixed TS errors.');
