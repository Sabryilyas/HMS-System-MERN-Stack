// Verify Stripe key is loaded correctly
import 'dotenv/config';

console.log('\n🔍 STRIPE KEY VERIFICATION\n');
console.log('='.repeat(60));

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
    console.log('❌ STRIPE_SECRET_KEY is NOT set in .env file!');
} else {
    console.log('✅ STRIPE_SECRET_KEY is loaded');
    console.log('   Length:', key.length, 'characters');
    console.log('   Starts with:', key.substring(0, 15) + '...');
    console.log('   Ends with:', '...' + key.substring(key.length - 10));

    // Check for common issues
    if (key.includes(' ')) {
        console.log('⚠️  WARNING: Key contains spaces!');
    }
    if (key.includes('\n') || key.includes('\r')) {
        console.log('⚠️  WARNING: Key contains newline characters!');
    }
    if (key === 'sk_test_placeholder') {
        console.log('❌ ERROR: Still using placeholder key!');
    }
    if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
        console.log('❌ ERROR: Key format is invalid!');
    }
}

console.log('='.repeat(60));
console.log('\n');
