import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkAndCreateUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        const existingUser = await User.findOne({ email: 'john@example.com' });

        if (existingUser) {
            console.log('✅ User john@example.com EXISTS in database');
            console.log('User details:', {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                createdAt: existingUser.createdAt
            });

            // Test password
            const isMatch = await existingUser.matchPassword('user123');
            console.log('Password "user123" match:', isMatch ? '✅ YES' : '❌ NO');

            if (!isMatch) {
                console.log('\n⚠️  Password does not match! Updating password...');
                existingUser.password = 'user123';
                await existingUser.save();
                console.log('✅ Password updated to "user123"');
            }
        } else {
            console.log('❌ User john@example.com NOT FOUND');
            console.log('Creating user...');

            const newUser = await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'user123',
                role: 'guest',
                phone: '1234567890',
                address: '123 Main St'
            });

            console.log('✅ User created successfully!');
            console.log('User details:', {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            });
        }

        // List all users
        const allUsers = await User.find().select('-password');
        console.log(`\n📊 Total users in database: ${allUsers.length}`);
        console.log('All users:');
        allUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkAndCreateUser();
