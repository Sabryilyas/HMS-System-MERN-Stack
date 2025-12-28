import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@hotel.com';
        const adminPassword = 'admin123';

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user already exists. Updating password...');
            admin.password = adminPassword; // Triggers pre-save hash
            admin.role = 'admin'; // Ensure role is admin
            await admin.save();
            console.log('✅ Admin password updated to: admin123');
        } else {
            // Create new admin
            admin = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                phone: '1234567890',
                address: 'Hotel HQ'
            });
            console.log('✅ Admin user created successfully');
        }

        console.log('-----------------------------------');
        console.log('📧 Email:    admin@hotel.com');
        console.log('🔑 Password: admin123');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
