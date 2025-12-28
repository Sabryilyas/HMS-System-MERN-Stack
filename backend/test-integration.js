import fetch from 'node-fetch';

// Polyfill for Node.js < 18 (just in case)
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let roomId = '';
let bookingId = '';

const runIntegrationTest = async () => {
    console.log('🚀 Starting Full System Integration Test...\n');

    try {
        // 1. REGISTER USER
        console.log('1️⃣  Testing User Registration...');
        const userEmail = `testuser${Date.now()}@example.com`;
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Integration Tester',
                email: userEmail,
                password: 'password123',
                phone: '1234567890' // Valid 10-digit phone
            })
        });
        const regData = await regRes.json();

        if (regData.success) {
            console.log('✅ User Registered:', regData.user.email);
            token = regData.token;
        } else {
            throw new Error(`Registration Failed: ${regData.message}`);
        }

        // 2. LOGIN USER
        console.log('\n2️⃣  Testing User Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();

        if (loginData.success) {
            console.log('✅ Login Successful');
            token = loginData.token; // Update token
        } else {
            throw new Error(`Login Failed: ${loginData.message}`);
        }

        // 3. FETCH ROOMS
        console.log('\n3️⃣  Testing Fetch Rooms...');
        const roomsRes = await fetch(`${API_URL}/rooms`);
        const roomsData = await roomsRes.json();

        if (roomsData.success && roomsData.data.length > 0) {
            console.log(`✅ Fetched ${roomsData.count} rooms`);
            roomId = roomsData.data[0]._id;
            console.log(`👉 Selected Room ID: ${roomId}`);
        } else {
            throw new Error('No rooms found. Did you run the seeder?');
        }

        // 4. CREATE BOOKING
        console.log('\n4️⃣  Testing Create Booking...');
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1); // Tomorrow
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 3); // 3 days later

        const bookingPayload = {
            room: roomId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guests: { adults: 2, children: 0 },
            totalPrice: 500,
            guestDetails: {
                firstName: 'Integration',
                lastName: 'Tester',
                email: userEmail,
                phone: '1234567890'
            }
        };

        const bookingRes = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingPayload)
        });
        const bookingData = await bookingRes.json();

        if (bookingData.success) {
            console.log('✅ Booking Created:', bookingData.data._id);
            bookingId = bookingData.data._id;
        } else {
            throw new Error(`Booking Failed: ${bookingData.message}`);
        }

        // 5. CREATE PAYMENT INTENT
        console.log('\n5️⃣  Testing Payment Intent Creation...');
        const paymentRes = await fetch(`${API_URL}/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId })
        });
        const paymentData = await paymentRes.json();

        if (paymentData.success) {
            console.log('✅ Payment Intent Created:', paymentData.paymentIntentId);
        } else {
            throw new Error(`Payment Intent Failed: ${paymentData.message}`);
        }

        console.log('\n🎉 ALL SYSTEMS GO! The backend is fully functional.');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    }
};

runIntegrationTest();
