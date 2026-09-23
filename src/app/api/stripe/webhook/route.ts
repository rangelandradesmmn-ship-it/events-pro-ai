import { headers } from 'next/headers';
import { NextResponse } from 'next/navigation';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// We need the service role key to bypass RLS in the webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const customerId = session.customer as string;

    await supabase
      .from('profiles')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    await supabase
      .from('profiles')
      .update({
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  return new NextResponse(null, { status: 200 });
}
