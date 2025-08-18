// Firebase Seeds
export { seedCategories } from './categories';
export { seedProducts } from './products'; 
export { seedUsers } from './users';
export { seedOrders } from './orders';

// Master seeding function
export async function seedAll() {
    console.log('🌱 Starting Firebase database seeding...');
    
    try {
        // Seed in proper order (dependencies first)
        console.log('\n1. Seeding categories...');
        await (await import('./categories')).seedCategories();
        
        console.log('\n2. Seeding users...');
        await (await import('./users')).seedUsers();
        
        console.log('\n3. Seeding products...');
        await (await import('./products')).seedProducts();
        
        console.log('\n4. Seeding orders...');
        await (await import('./orders')).seedOrders();
        
        console.log('\n🎉 All seeding completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        throw error;
    }
}

// For standalone execution
async function main() {
    try {
        await seedAll();
        process.exit(0);
    } catch (error) {
        console.error('❌ Master seeder failed:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}