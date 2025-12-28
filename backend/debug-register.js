import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

const runDebug = async () => {
    console.log('🐞 Debugging Registration Failure Case...');

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Fail User',
                email: `fail${Date.now()}@test.com`,
                password: 'password123',
                phone: '4214142325232', // Invalid phone (too long)
                address: '123 Fail Lane'
            })
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (res.status === 400) {
            console.log('✅ SUCCESS: Backend correctly returned 400 Bad Request');
        } else if (res.status === 500) {
            console.log('❌ FAILURE: Backend crashed with 500 Internal Server Error');
        } else {
            console.log('⚠️ UNEXPECTED: Got status', res.status);
        }

    } catch (err) {
        console.error('❌ Request Failed:', err);
    }
};

runDebug();
