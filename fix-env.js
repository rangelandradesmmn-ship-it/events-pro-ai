const fs = require('fs');

// Fix stripe checkout
let f3 = 'src/app/api/stripe/checkout/route.ts';
let c3 = fs.readFileSync(f3, 'utf-8');
c3 = c3.replace(
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {",
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {"
);
fs.writeFileSync(f3, c3);

// Fix stripe webhook
let f4 = 'src/app/api/stripe/webhook/route.ts';
let c4 = fs.readFileSync(f4, 'utf-8');
c4 = c4.replace(
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {",
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {"
);
c4 = c4.replace(
  "process.env.NEXT_PUBLIC_SUPABASE_URL!,",
  "process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',"
);
c4 = c4.replace(
  "process.env.SUPABASE_SERVICE_ROLE_KEY!",
  "process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'"
);
fs.writeFileSync(f4, c4);

console.log('Fixed env errors during build.');
