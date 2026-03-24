/**
 * Admin User Seeding Script
 * Run this to create an initial admin user when database is empty
 * Usage: npx ts-node src/seed/seed-admin.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../model/user.model';
import { DBConnection } from '../db/DBConnection';

dotenv.config();

// Default admin credentials
const DEFAULT_ADMIN = {
    name: 'Admin User',
    email: 'admin@transportmanagement.com',
    password: 'Admin@123456', // Change this to a strong password
    role: 'admin',
    contactNumber: '+94700000000',
    isApproved: true,
    walletBalance: 0,
};

async function seedAdmin() {
    try {
        console.log('🌱 Starting admin user seeding...');

        // Connect to database
        await DBConnection();
        console.log('✅ Connected to database');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log('✋ Skipping seed to prevent duplicates.');
            await mongoose.disconnect();
            return;
        }

        // Check if any user with admin email exists
        const emailExists = await User.findOne({ email: DEFAULT_ADMIN.email });
        if (emailExists) {
            console.log('⚠️  Email already exists with different role!');
            console.log(`📧 Email: ${emailExists.email}, Role: ${emailExists.role}`);
            await mongoose.disconnect();
            return;
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(DEFAULT_ADMIN.password, 10);

        // Create admin user
        const adminUser = new User({
            ...DEFAULT_ADMIN,
            password: hashedPassword,
        });

        await adminUser.save();

        console.log('\n✅ Admin user created successfully!\n');
        console.log('📊 Admin User Details:');
        console.log('─'.repeat(50));
        console.log(`📧 Email:    ${DEFAULT_ADMIN.email}`);
        console.log(`🔐 Password: ${DEFAULT_ADMIN.password}`);
        console.log(`📱 Contact:  ${DEFAULT_ADMIN.contactNumber}`);
        console.log(`👤 Name:     ${DEFAULT_ADMIN.name}`);
        console.log('─'.repeat(50));
        console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
        console.log('💾 Store these credentials securely.\n');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Database connection closed');
    }
}

// Run the seeding function
seedAdmin();
