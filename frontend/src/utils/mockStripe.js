// Mock Stripe Client - Simulates Stripe payment flow without real API

export const confirmCardPayment = async (clientSecret, paymentMethodData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const paymentIntentId = clientSecret.split('_secret_')[0];

    const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 32670,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        charges: {
            data: [{
                id: `ch_mock_${Date.now()}`,
                amount: 32670,
                currency: 'usd',
                status: 'succeeded',
                payment_method_details: {
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2025
                    }
                }
            }]
        }
    };

    return {
        paymentIntent: mockPaymentIntent,
        error: null
    };
};

export default {
    confirmCardPayment
};
