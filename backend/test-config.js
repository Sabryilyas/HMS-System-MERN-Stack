// Quick test script to verify Stripe and MongoDB configuration
import 'dotenv/config';
import Stripe from 'stripe';

console.log('\n🔍 CONFIGURATION CHECK\n');
console.log('='.repeat(50));

// Check MongoDB URI
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
    console.log('✅ MongoDB URI is set');
    console.log('   Format:', mongoUri.substring(0, 30) + '...');
} else {
    console.log('❌ MongoDB URI is NOT set');
}

// Check Stripe Secret Key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey) {
    console.log('✅ Stripe Secret Key is set');
    console.log('   Starts with:', stripeKey.substring(0, 20) + '...');

    // Test Stripe connection
    try {
        const stripe = new Stripe(stripeKey);
        console.log('✅ Stripe initialized successfully');

        // Try to create a test payment intent
        const testIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        console.log('✅ Stripe API is working! Test payment intent created:', testIntent.id);
    } catch (error) {
        console.log('❌ Stripe API Error:', error.message);
    }
} else {
    console.log('❌ Stripe Secret Key is NOT set');
}

console.log('='.repeat(50));
console.log('\n');
