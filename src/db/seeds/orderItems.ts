import { db } from '@/db';
import { orderItems } from '@/db/schema';

async function main() {
    const sampleOrderItems = [
        // Order 1 (ID:1) - iPhone and Accessories
        {
            orderId: 1,
            productId: 1, // iPhone 15 Pro
            quantity: 1,
            price: 999.99,
            size: 'N/A',
            color: 'Space Black',
        },
        {
            orderId: 1,
            productId: 2, // MacBook Air M3
            quantity: 1,
            price: 1299.99,
            size: 'N/A',
            color: 'Starlight',
        },

        // Order 2 (ID:2) - Office Supplies
        {
            orderId: 2,
            productId: 7, // Ergonomic Office Chair
            quantity: 1,
            price: 299.99,
            size: 'N/A',
            color: 'Black',
        },
        {
            orderId: 2,
            productId: 8, // Wireless Keyboard
            quantity: 1,
            price: 79.99,
            size: 'N/A',
            color: 'Gray',
        },
        {
            orderId: 2,
            productId: 9, // External SSD 1TB
            quantity: 1,
            price: 119.99,
            size: 'N/A',
            color: 'Silver',
        },

        // Order 3 (ID:3) - Fitness Gear
        {
            orderId: 3,
            productId: 10, // Running Shoes
            quantity: 1,
            price: 119.99,
            size: 'M-10',
            color: 'Blue',
        },
        {
            orderId: 3,
            productId: 11, // Workout T-Shirt
            quantity: 2,
            price: 24.99,
            size: 'L',
            color: 'Gray',
        },
        {
            orderId: 3,
            productId: 12, // Yoga Mat
            quantity: 1,
            price: 34.99,
            size: 'N/A',
            color: 'Purple',
        },

        // Order 4 (ID:4) - Home Appliances
        {
            orderId: 4,
            productId: 13, // Smart Coffee Maker
            quantity: 1,
            price: 149.99,
            size: 'N/A',
            color: 'Stainless Steel',
        },
        {
            orderId: 4,
            productId: 14, // Robot Vacuum Cleaner
            quantity: 1,
            price: 349.99,
            size: 'N/A',
            color: 'White',
        },

        // Order 5 (ID:5) - Casual Wear
        {
            orderId: 5,
            productId: 4, // Classic T-Shirt
            quantity: 3,
            price: 19.99,
            size: 'M',
            color: 'Black',
        },
        {
            orderId: 5,
            productId: 5, // Hoodie
            quantity: 1,
            price: 49.99,
            size: 'L',
            color: 'Navy',
        },
        {
            orderId: 5,
            productId: 6, // Jeans
            quantity: 1,
            price: 59.99,
            size: '32x32',
            color: 'Dark Blue',
        },

        // Order 6 (ID:6) - Winter Apparel
        {
            orderId: 6,
            productId: 15, // Winter Jacket
            quantity: 1,
            price: 129.99,
            size: 'XL',
            color: 'Black',
        },
        {
            orderId: 6,
            productId: 16, // Wool Scarf
            quantity: 1,
            price: 29.99,
            size: 'N/A',
            color: 'Gray',
        },

        // Order 7 (ID:7) - Gaming Setup
        {
            orderId: 7,
            productId: 17, // Gaming Headset
            quantity: 1,
            price: 89.99,
            size: 'N/A',
            color: 'Red',
        },
        {
            orderId: 7,
            productId: 18, // Mechanical Keyboard
            quantity: 1,
            price: 119.99,
            size: 'N/A',
            color: 'RGB',
        },

        // Order 8 (ID:8) - Books and Media
        {
            orderId: 8,
            productId: 19, // Bestselling Novel
            quantity: 1,
            price: 14.99,
            size: 'N/A',
            color: 'N/A',
        },
        {
            orderId: 8,
            productId: 20, // Blueprint Coffee Table Book
            quantity: 1,
            price: 49.99,
            size: 'N/A',
            color: 'N/A',
        },

        // Order 9 (ID:9) - Outdoor Gear
        {
            orderId: 9,
            productId: 21, // Backpack
            quantity: 1,
            price: 79.99,
            size: 'N/A',
            color: 'Green',
        },
        {
            orderId: 9,
            productId: 22, // Tent
            quantity: 1,
            price: 199.99,
            size: '2-person',
            color: 'Orange',
        },

        // Order 10 (ID:10) - Home Decor
        {
            orderId: 10,
            productId: 23, // Decorative Pillow
            quantity: 2,
            price: 25.00,
            size: 'N/A',
            color: 'Beige',
        },
        {
            orderId: 10,
            productId: 24, // Scented Candles
            quantity: 1,
            price: 18.00,
            size: 'N/A',
            color: 'Lavender',
        },
        {
            orderId: 10,
            productId: 25, // Wall Art Print
            quantity: 1,
            price: 60.00,
            size: 'Medium',
            color: 'Abstract',
        },

        // Order 11 (ID:11) - Electronics Mix
        {
            orderId: 11,
            productId: 3, // AirPods Pro
            quantity: 1,
            price: 249.99,
            size: 'N/A',
            color: 'White',
        },
        {
            orderId: 11,
            productId: 8, // Wireless Keyboard
            quantity: 1,
            price: 79.99,
            size: 'N/A',
            color: 'Black',
        },
        {
            orderId: 11,
            productId: 19, // Bestselling Novel
            quantity: 1,
            price: 14.99,
            size: 'N/A',
            color: 'N/A',
        },

        // Order 12 (ID:12) - Clothing Bundle
        {
            orderId: 12,
            productId: 4, // Classic T-Shirt
            quantity: 2,
            price: 19.99,
            size: 'L',
            color: 'White',
        },
        {
            orderId: 12,
            productId: 5, // Hoodie
            quantity: 1,
            price: 49.99,
            size: 'XL',
            color: 'Black',
        },
        {
            orderId: 12,
            productId: 6, // Jeans
            quantity: 1,
            price: 59.99,
            size: '34x32',
            color: 'Light Blue',
        },
        {
            orderId: 12,
            productId: 11, // Workout T-Shirt
            quantity: 1,
            price: 24.99,
            size: 'M',
            color: 'Green',
        },

        // Order 13 (ID:13) - Kitchen Gadgets
        {
            orderId: 13,
            productId: 13, // Smart Coffee Maker
            quantity: 1,
            price: 149.99,
            size: 'N/A',
            color: 'Black',
        },
        {
            orderId: 13,
            productId: 26, // Air Fryer
            quantity: 1,
            price: 89.99,
            size: 'N/A',
            color: 'Silver',
        },
        {
            orderId: 13,
            productId: 27, // Blender
            quantity: 1,
            price: 79.99,
            size: 'N/A',
            color: 'Black',
        },

        // Order 14 (ID:14) - Sports and Recreation
        {
            orderId: 14,
            productId: 10, // Running Shoes
            quantity: 1,
            price: 119.99,
            size: 'W-8',
            color: 'Pink',
        },
        {
            orderId: 14,
            productId: 12, // Yoga Mat
            quantity: 1,
            price: 34.99,
            size: 'N/A',
            color: 'Blue',
        },
        {
            orderId: 14,
            productId: 28, // Water Bottle
            quantity: 2,
            price: 15.00,
            size: '750ml',
            color: 'Clear',
        },

        // Order 15 (ID:15) - Mixed Bag
        {
            orderId: 15,
            productId: 1, // iPhone 15 Pro
            quantity: 1,
            price: 999.99,
            size: 'N/A',
            color: 'Natural Titanium',
        },
        {
            orderId: 15,
            productId: 4, // Classic T-Shirt
            quantity: 1,
            price: 19.99,
            size: 'XL',
            color: 'Red',
        },
        {
            orderId: 15,
            productId: 25, // Wall Art Print
            quantity: 1,
            price: 60.00,
            size: 'Small',
            color: 'Landscape',
        },
        {
            orderId: 15,
            productId: 17, // Gaming Headset
            quantity: 1,
            price: 89.99,
            size: 'N/A',
            color: 'Black',
        },
    ];

    await db.insert(orderItems).values(sampleOrderItems);

    console.log('✅ Order items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});