import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hms_db';
        console.log(`Debug: Connecting to ${uri.replace(/:([^@]+)@/, ':****@')}`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const createStaff = async () => {
    await connectDB();

    const staffEmail = 'staff@mail.com';
    const staffPassword = 'staff123';

    try {
        // Check if exists
        const exists = await User.findOne({ email: staffEmail });

        if (exists) {
            console.log('Staff user already exists. Updating role and password...');
            exists.password = staffPassword; // User model pre-save hook will hash it
            exists.role = 'staff';
            exists.hotelId = 'Colombo';
            exists.taskType = 'housekeeping';
            await exists.save();
            console.log('Staff user updated.');
        } else {
            await User.create({
                name: 'Staff User',
                email: staffEmail,
                password: staffPassword,
                role: 'staff',
                hotelId: 'Colombo',
                taskType: 'housekeeping',
                phone: '1234567890',
                isActive: true
            });
            console.log('Staff user created.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createStaff();
