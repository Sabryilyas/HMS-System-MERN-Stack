import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4242;

// Verify Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ FATAL: STRIPE_SECRET_KEY is NOT set in .env file!');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Create Payment Intent
app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount provided.' });
    }

    const amountInCents = Math.round(amount);

    if (amountInCents < 50) {
      return res.status(400).json({ error: 'Minimum amount is $0.50 (50 cents).' });
    }

    console.log(`💳 Creating payment intent for $${(amountInCents / 100).toFixed(2)}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      description: 'HotelHub Booking Payment',
    });

    console.log(`✅ Payment Intent Created: ${paymentIntent.id}`);
    
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Stripe Error:', error.message);
    res.status(500).json({ 
      error: `Payment Intent Error: ${error.message}` 
    });
  }
});

// Retrieve Payment Intent (for verification)
app.get('/api/payments/payment-intent/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.status(200).json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      charges: paymentIntent.charges.data,
    });
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('⚠️ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════════════════════');
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  console.log('✅ Stripe secret key is loaded');
  console.log('✅ CORS is enabled');
  console.log('════════════════════════════════════════════════════');
  console.log('');
});