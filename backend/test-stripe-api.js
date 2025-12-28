// Test actual Stripe API connection
import 'dotenv/config';
import Stripe from 'stripe';

console.log('\n🧪 TESTING STRIPE API CONNECTION\n');
console.log('='.repeat(60));

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
    console.log('❌ No Stripe key found!');
    process.exit(1);
}

console.log('📡 Attempting to connect to Stripe API...\n');

try {
    const stripe = new Stripe(key);

    // Try to create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
    });

    console.log('✅ SUCCESS! Stripe API is working!');
    console.log('   Payment Intent ID:', paymentIntent.id);
    console.log('   Amount:', paymentIntent.amount / 100, 'USD');
    console.log('   Status:', paymentIntent.status);
    console.log('\n🎉 Your Stripe configuration is PERFECT!\n');

} catch (error) {
    console.log('❌ STRIPE API ERROR!\n');
    console.log('Error Type:', error.type);
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('Status Code:', error.statusCode);

    if (error.statusCode === 401) {
        console.log('\n💡 SOLUTION:');
        console.log('   Your API key is invalid or restricted.');
        console.log('   1. Go to https://dashboard.stripe.com/test/apikeys');
        console.log('   2. Get a fresh "Secret key" (starts with sk_test_)');
        console.log('   3. Update STRIPE_SECRET_KEY in .env file');
        console.log('   4. Restart the server\n');
    }
}

console.log('='.repeat(60));
console.log('\n');
