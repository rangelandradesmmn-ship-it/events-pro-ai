const fs = require('fs');

let f3 = 'src/app/api/stripe/checkout/route.ts';
let c3 = fs.readFileSync(f3, 'utf-8');
c3 = c3.replace(
  "success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,",
  "success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://eventsproai.com.br'}/dashboard?success=true`,"
);
c3 = c3.replace(
  "cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,",
  "cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://eventsproai.com.br'}/dashboard/billing?canceled=true`,"
);
fs.writeFileSync(f3, c3);

console.log('Fixed Stripe URL.');
