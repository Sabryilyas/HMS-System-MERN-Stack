import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

const createTestUser = async () => {
    try {
        await connectDB();

        const testEmail = 'john@example.com';
        const testPassword = 'user123';

        // Check if user already exists
        let user = await User.findOne({ email: testEmail });

        if (user) {
            console.log('✅ User john@example.com already exists. Updating password...');
            user.password = testPassword; // Triggers pre-save hash
            user.role = 'guest'; // Ensure role is guest
            await user.save();
            console.log('✅ Password updated to: user123');
        } else {
            // Create new user
            user = await User.create({
                name: 'John Doe',
                email: testEmail,
                password: testPassword,
                role: 'guest',
                phone: '1234567890',
                address: '123 Main Street'
            });
            console.log('✅ Test user created successfully');
        }

        console.log('-----------------------------------');
        console.log('📧 Email:    john@example.com');
        console.log('🔑 Password: user123');
        console.log('👤 Role:     guest');
        console.log('-----------------------------------');

        // List all users
        const allUsers = await User.find().select('name email role');
        console.log(`\n📊 Total users in database: ${allUsers.length}`);
        allUsers.forEach(u => {
            console.log(`  - ${u.email} (${u.role}) - ${u.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestUser();
