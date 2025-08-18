import { AuthService } from '../services/auth';
import { User } from '../types';

export async function seedUsers() {
    console.log('⏳ Seeding users...');
    
    const sampleUsers = [
        {
            email: 'admin@gmail.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
        },
        {
            email: 'user@gmail.com',
            password: 'user123',
            name: 'Regular User',
            role: 'user',
        },
        {
            email: 'manager@gmail.com',
            password: 'manager123',
            name: 'Store Manager',
            role: 'manager',
        },
        {
            email: 'customer@gmail.com',
            password: 'customer123',
            name: 'John Customer',
            role: 'user',
        },
        {
            email: 'support@gmail.com',
            password: 'support123',
            name: 'Support Agent',
            role: 'support',
        },
    ];

    try {
        const createdUsers = [];
        
        for (const userData of sampleUsers) {
            try {
                // Create user with Firebase Auth and Firestore profile
                const { user } = await AuthService.register(
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.role
                );
                
                createdUsers.push(user);
                console.log(`✅ Created user: ${user.name} (${user.email})`);
            } catch (error: any) {
                if (error.message === 'Email already exists') {
                    console.log(`⚠️  User already exists: ${userData.email}`);
                } else {
                    console.error(`❌ Failed to create user ${userData.email}:`, error.message);
                }
            }
        }
        
        console.log('✅ Users seeder completed successfully');
        return createdUsers;
    } catch (error) {
        console.error('❌ Users seeder failed:', error);
        throw error;
    }
}

// For standalone execution
async function main() {
    try {
        await seedUsers();
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}