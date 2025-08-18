import { ProductsService } from '../services/products';
import { Product } from '../types';

export async function seedProducts() {
    console.log('⏳ Seeding products...');
    
    const sampleProducts: Omit<Product, 'id'>[] = [
        // Electronics
        {
            name: 'iPhone 15 Pro',
            description: 'The latest iPhone with a powerful A17 Bionic chip, advanced camera system, and a durable design.',
            price: 999.99,
            salePrice: 899.99,
            imageUrl: '/images/iphone15pro.jpg',
            category: 'electronics',
            color: 'blue/black',
            size: '128GB/256GB/512GB',
            stockQuantity: 50,
            isFeatured: true,
            createdAt: new Date('2024-03-01T10:00:00Z').toISOString(),
        },
        {
            name: 'Samsung Galaxy Watch',
            description: 'Advanced smartwatch with health tracking, GPS, and long battery life. Perfect for fitness enthusiasts.',
            price: 249.00,
            salePrice: null,
            imageUrl: '/images/galaxywatch.jpg',
            category: 'electronics',
            color: 'black/silver',
            size: '40mm/44mm',
            stockQuantity: 30,
            isFeatured: false,
            createdAt: new Date('2024-03-05T11:00:00Z').toISOString(),
        },
        {
            name: 'MacBook Air M2',
            description: 'Ultra-thin and incredibly powerful laptop featuring the Apple M2 chip. Ideal for everyday use and creative tasks.',
            price: 1199.00,
            salePrice: 1099.00,
            imageUrl: '/images/macbookairm2.jpg',
            category: 'electronics',
            color: 'silver/space gray',
            size: '13"/15"',
            stockQuantity: 15,
            isFeatured: true,
            createdAt: new Date('2024-03-10T12:00:00Z').toISOString(),
        },
        {
            name: 'Wireless Headphones',
            description: 'High-fidelity wireless headphones with comfortable earcups and exceptional sound quality. Perfect for music lovers.',
            price: 159.00,
            salePrice: null,
            imageUrl: '/images/wirelessheadphones.jpg',
            category: 'electronics',
            color: 'black/white',
            size: 'One Size',
            stockQuantity: 75,
            isFeatured: false,
            createdAt: new Date('2024-03-15T13:00:00Z').toISOString(),
        },
        // Clothing
        {
            name: 'Classic T-Shirt',
            description: 'Soft, breathable cotton t-shirt, perfect for everyday wear. Available in multiple colors.',
            price: 19.99,
            salePrice: 14.99,
            imageUrl: '/images/tshirt.jpg',
            category: 'clothing',
            color: 'white/black/blue',
            size: 'S/M/L/XL',
            stockQuantity: 100,
            isFeatured: false,
            createdAt: new Date('2024-02-20T10:00:00Z').toISOString(),
        },
        {
            name: 'Denim Jeans',
            description: 'Durable and stylish denim jeans with a comfortable fit. A wardrobe essential for any occasion.',
            price: 79.99,
            salePrice: null,
            imageUrl: '/images/denimjeans.jpg',
            category: 'clothing',
            color: 'blue/black',
            size: '28/30/32/34/36',
            stockQuantity: 60,
            isFeatured: true,
            createdAt: new Date('2024-02-22T11:00:00Z').toISOString(),
        },
        {
            name: 'Running Shoes',
            description: 'Lightweight and supportive running shoes designed for optimal performance and comfort during runs.',
            price: 129.99,
            salePrice: 99.99,
            imageUrl: '/images/runningshoes.jpg',
            category: 'clothing',
            color: 'white/black/red',
            size: '8/9/10/11/12',
            stockQuantity: 40,
            isFeatured: true,
            createdAt: new Date('2024-02-25T12:00:00Z').toISOString(),
        },
        {
            name: 'Winter Jacket',
            description: 'Warm and waterproof winter jacket, perfect for cold weather. Features multiple pockets and a comfortable lining.',
            price: 199.99,
            salePrice: null,
            imageUrl: '/images/winterjacket.jpg',
            category: 'clothing',
            color: 'black/navy',
            size: 'S/M/L/XL',
            stockQuantity: 25,
            isFeatured: false,
            createdAt: new Date('2024-02-28T13:00:00Z').toISOString(),
        },
        // Books
        {
            name: 'Programming Guide',
            description: 'A comprehensive guide to modern programming concepts, suitable for beginners and experienced developers.',
            price: 49.99,
            salePrice: 39.99,
            imageUrl: '/images/programmingguide.jpg',
            category: 'books',
            color: 'N/A',
            size: 'Paperback/Hardcover',
            stockQuantity: 80,
            isFeatured: false,
            createdAt: new Date('2024-01-10T09:00:00Z').toISOString(),
        },
        {
            name: 'Cookbook Collection',
            description: 'A delightful collection of recipes from around the world, perfect for any home chef.',
            price: 29.99,
            salePrice: null,
            imageUrl: '/images/cookbook.jpg',
            category: 'books',
            color: 'N/A',
            size: 'Standard',
            stockQuantity: 45,
            isFeatured: false,
            createdAt: new Date('2024-01-12T10:00:00Z').toISOString(),
        },
        {
            name: 'Mystery Novel',
            description: 'An thrilling mystery novel with unexpected twists and turns, keeping you on the edge of your seat.',
            price: 14.99,
            salePrice: null,
            imageUrl: '/images/mysterynovel.jpg',
            category: 'books',
            color: 'N/A',
            size: 'Paperback',
            stockQuantity: 120,
            isFeatured: false,
            createdAt: new Date('2024-01-15T11:00:00Z').toISOString(),
        },
        // Home & Garden
        {
            name: 'Garden Tools Set',
            description: 'Essential gardening tools for planting, weeding, and maintaining your garden. Durable and ergonomic.',
            price: 89.99,
            salePrice: 69.99,
            imageUrl: '/images/gardentools.jpg',
            category: 'home-garden',
            color: 'green/black',
            size: 'Standard',
            stockQuantity: 35,
            isFeatured: false,
            createdAt: new Date('2024-04-01T14:00:00Z').toISOString(),
        },
        {
            name: 'Kitchen Knife Set',
            description: 'High-quality stainless steel knife set for all your culinary needs. Includes various knives for different tasks.',
            price: 149.99,
            salePrice: null,
            imageUrl: '/images/knifeset.jpg',
            category: 'home-garden',
            color: 'silver',
            size: '6-piece/12-piece',
            stockQuantity: 20,
            isFeatured: true,
            createdAt: new Date('2024-04-05T15:00:00Z').toISOString(),
        },
        {
            name: 'Plant Pot Collection',
            description: 'Stylish and durable plant pots in various sizes, perfect for indoor and outdoor plants.',
            price: 24.99,
            salePrice: null,
            imageUrl: '/images/plantpots.jpg',
            category: 'home-garden',
            color: 'terra cotta/white',
            size: 'Small/Medium/Large',
            stockQuantity: 90,
            isFeatured: false,
            createdAt: new Date('2024-04-10T16:00:00Z').toISOString(),
        },
        // Sports & Outdoors
        {
            name: 'Yoga Mat',
            description: 'Non-slip yoga mat providing excellent grip and cushioning for all your yoga and fitness practices.',
            price: 39.99,
            salePrice: 29.99,
            imageUrl: '/images/yogamat.jpg',
            category: 'sports-outdoors',
            color: 'purple/blue/pink',
            size: 'Standard',
            stockQuantity: 65,
            isFeatured: false,
            createdAt: new Date('2024-05-01T09:00:00Z').toISOString(),
        },
        {
            name: 'Tennis Racket',
            description: 'Lightweight and powerful tennis racket suitable for players of all skill levels. Enhances swing speed.',
            price: 179.99,
            salePrice: null,
            imageUrl: '/images/tennisracket.jpg',
            category: 'sports-outdoors',
            color: 'black/red',
            size: 'Standard',
            stockQuantity: 25,
            isFeatured: false,
            createdAt: new Date('2024-05-05T10:00:00Z').toISOString(),
        },
        {
            name: 'Water Bottle',
            description: 'Durable and leak-proof water bottle, ideal for hydration on the go during sports or daily activities.',
            price: 19.99,
            salePrice: null,
            imageUrl: '/images/waterbottle.jpg',
            category: 'sports-outdoors',
            color: 'blue/black/white',
            size: '16oz/24oz/32oz',
            stockQuantity: 150,
            isFeatured: false,
            createdAt: new Date('2024-05-10T11:00:00Z').toISOString(),
        },
        // Health & Beauty
        {
            name: 'Face Moisturizer',
            description: 'Hydrating face moisturizer for all skin types. Leaves skin feeling soft, smooth, and refreshed.',
            price: 34.99,
            salePrice: 24.99,
            imageUrl: '/images/facemoisturizer.jpg',
            category: 'health-beauty',
            color: 'N/A',
            size: '50ml/100ml',
            stockQuantity: 70,
            isFeatured: true,
            createdAt: new Date('2024-06-01T12:00:00Z').toISOString(),
        },
        {
            name: 'Vitamin Supplements',
            description: 'Daily vitamin supplements to support overall health and well-being. Packed with essential nutrients.',
            price: 24.99,
            salePrice: null,
            imageUrl: '/images/vitamins.jpg',
            category: 'health-beauty',
            color: 'N/A',
            size: '60 caps/120 caps',
            stockQuantity: 85,
            isFeatured: false,
            createdAt: new Date('2024-06-05T13:00:00Z').toISOString(),
        },
        {
            name: 'Hair Shampoo',
            description: 'Gentle and nourishing hair shampoo for everyday use. Leaves hair clean, shiny, and healthy.',
            price: 16.99,
            salePrice: null,
            imageUrl: '/images/shampoo.jpg',
            category: 'health-beauty',
            color: 'N/A',
            size: '250ml/500ml',
            stockQuantity: 110,
            isFeatured: false,
            createdAt: new Date('2024-06-10T14:00:00Z').toISOString(),
        },
    ];

    try {
        const createdProducts = [];
        
        for (const product of sampleProducts) {
            const created = await ProductsService.create(product);
            createdProducts.push(created);
            console.log(`✅ Created product: ${created.name}`);
        }
        
        console.log('✅ Products seeder completed successfully');
        return createdProducts;
    } catch (error) {
        console.error('❌ Products seeder failed:', error);
        throw error;
    }
}

// For standalone execution
async function main() {
    try {
        await seedProducts();
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}