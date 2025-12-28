// Native fetch is available in Node.js 18+

const API_URL = 'http://localhost:5000/api/auth';

// Test User Data
const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`, // Unique email every time
    password: 'password123',
    phone: '1234567890',
    address: '123 Test St'
};

const runTests = async () => {
    console.log('🚀 Starting Auth API Tests...\n');

    try {
        // 1. TEST REGISTRATION
        console.log('1️⃣  Testing Registration...');
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();

        if (regRes.ok) {
            console.log('✅ Registration Successful!');
            console.log(`   User ID: ${regData.user.id}`);
            console.log(`   Token: ${regData.token.substring(0, 20)}...`);
        } else {
            console.error('❌ Registration Failed:', regData.message);
            return;
        }

        console.log('\n-----------------------------------\n');

        // 2. TEST LOGIN
        console.log('2️⃣  Testing Login...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
            console.log('✅ Login Successful!');
            console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
        } else {
            console.error('❌ Login Failed:', loginData.message);
            return;
        }

        console.log('\n-----------------------------------\n');

        // 3. TEST GET ME (Protected Route)
        console.log('3️⃣  Testing Get Current User (Protected Route)...');
        const meRes = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const meData = await meRes.json();

        if (meRes.ok) {
            console.log('✅ Get Me Successful!');
            console.log(`   User: ${meData.data.name} (${meData.data.email})`);
            console.log(`   Role: ${meData.data.role}`);
        } else {
            console.error('❌ Get Me Failed:', meData.message);
            return;
        }

        console.log('\n🎉 ALL AUTH TESTS PASSED! Backend is ready for Part 5.');

    } catch (error) {
        console.error('❌ Test Script Error:', error.message);
        console.log('💡 Is the server running? Make sure npm run dev is active.');
    }
};

runTests();
