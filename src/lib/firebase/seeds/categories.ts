import { CategoriesService } from '../services/categories';
import { Category } from '../types';

export async function seedCategories() {
    console.log('⏳ Seeding categories...');
    
    const sampleCategories: Omit<Category, 'id'>[] = [
        {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices and gadgets',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Clothing',
            slug: 'clothing',
            description: 'Fashion and apparel for all ages',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Books',
            slug: 'books',
            description: 'Books, magazines and educational materials',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Home & Garden',
            slug: 'home-garden',
            description: 'Home improvement and gardening supplies',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Sports & Outdoors',
            slug: 'sports-outdoors',
            description: 'Sports equipment and outdoor gear',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Health & Beauty',
            slug: 'health-beauty',
            description: 'Health, wellness and beauty products',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Toys & Games',
            slug: 'toys-games',
            description: 'Toys, games and entertainment for kids',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Automotive',
            slug: 'automotive',
            description: 'Car parts, tools and automotive accessories',
            createdAt: new Date().toISOString(),
        },
    ];

    try {
        const createdCategories = [];
        
        for (const category of sampleCategories) {
            const created = await CategoriesService.create(category);
            createdCategories.push(created);
            console.log(`✅ Created category: ${created.name}`);
        }
        
        console.log('✅ Categories seeder completed successfully');
        return createdCategories;
    } catch (error) {
        console.error('❌ Categories seeder failed:', error);
        throw error;
    }
}

// For standalone execution
async function main() {
    try {
        await seedCategories();
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}