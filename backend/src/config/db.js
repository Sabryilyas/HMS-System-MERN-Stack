import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * This will be used in Part 2 when we set up MongoDB Atlas
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are no longer needed in Mongoose 6+
            // but included for compatibility
        });

        console.log('');
        console.log('════════════════════════════════════════════════════════');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database Name: ${conn.connection.name}`);
        console.log('════════════════════════════════════════════════════════');
        console.log('');
    } catch (error) {
        console.error('');
        console.error('════════════════════════════════════════════════════════');
        console.error('❌ MongoDB Connection Error:');
        console.error(error.message);
        console.error('════════════════════════════════════════════════════════');
        console.error('');
        console.error('💡 Troubleshooting:');
        console.error('   1. Check if MONGODB_URI is set in .env file');
        console.error('   2. Verify MongoDB Atlas cluster is running');
        console.error('   3. Check if IP address is whitelisted');
        console.error('   4. Verify database user credentials');
        console.error('');
        process.exit(1);
    }
};

export default connectDB;
