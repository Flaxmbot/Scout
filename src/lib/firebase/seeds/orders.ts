import { OrdersService } from '../services/orders';
import { Order } from '../types';

export async function seedOrders() {
    console.log('⏳ Seeding orders...');
    
    const sampleOrders: Omit<Order, 'id'>[] = [
        {
            customerName: 'Alice Johnson',
            customerEmail: 'alice.johnson@example.com',
            customerPhone: '555-123-4567',
            shippingAddress: '123 Maple St, Anytown, CA 90210',
            totalAmount: 185.75,
            status: 'delivered',
            createdAt: new Date('2024-01-05T10:30:00Z').toISOString(),
        },
        {
            customerName: 'Bob Williams',
            customerEmail: 'bob.williams@example.com',
            customerPhone: '(555) 987-6543',
            shippingAddress: '456 Oak Ave, Villagetown, NY 10001',
            totalAmount: 349.99,
            status: 'shipped',
            createdAt: new Date('2024-01-07T14:00:00Z').toISOString(),
        },
        {
            customerName: 'Charlie Brown',
            customerEmail: 'charlie.b@example.com',
            customerPhone: '555 234 5678',
            shippingAddress: '789 Pine Dr, Cityville, TX 77001',
            totalAmount: 75.50,
            status: 'processing',
            createdAt: new Date('2024-01-10T09:15:00Z').toISOString(),
        },
        {
            customerName: 'Diana Prince',
            customerEmail: 'd.prince@example.com',
            customerPhone: '+1-555-876-5432',
            shippingAddress: '101 Main Rd, Hometown, FL 33101',
            totalAmount: 50.00,
            status: 'pending',
            createdAt: new Date('2024-01-12T11:45:00Z').toISOString(),
        },
        {
            customerName: 'Eve Davis',
            customerEmail: 'eve.d@example.com',
            customerPhone: '5551112233',
            shippingAddress: '202 Bridge Ln, Metropol, GA 30303',
            totalAmount: 230.25,
            status: 'delivered',
            createdAt: new Date('2024-01-15T16:20:00Z').toISOString(),
        },
        {
            customerName: 'Frank Miller',
            customerEmail: 'frank.miller@example.com',
            customerPhone: '555-444-3333',
            shippingAddress: '303 Valley View, Hillside, WA 98001',
            totalAmount: 125.99,
            status: 'cancelled',
            createdAt: new Date('2024-01-18T12:30:00Z').toISOString(),
        },
        {
            customerName: 'Grace Lee',
            customerEmail: 'grace.lee@example.com',
            customerPhone: '555-666-7777',
            shippingAddress: '404 Summit St, Mountain View, CO 80424',
            totalAmount: 89.50,
            status: 'shipped',
            createdAt: new Date('2024-01-20T15:00:00Z').toISOString(),
        },
        {
            customerName: 'Henry Wilson',
            customerEmail: 'h.wilson@example.com',
            customerPhone: '555-888-9999',
            shippingAddress: '505 River Rd, Riverside, OR 97001',
            totalAmount: 299.00,
            status: 'processing',
            createdAt: new Date('2024-01-22T09:45:00Z').toISOString(),
        },
    ];

    try {
        const createdOrders = [];
        
        for (const order of sampleOrders) {
            const created = await OrdersService.create(order);
            createdOrders.push(created);
            console.log(`✅ Created order: ${created.id} for ${created.customerName}`);
        }
        
        console.log('✅ Orders seeder completed successfully');
        return createdOrders;
    } catch (error) {
        console.error('❌ Orders seeder failed:', error);
        throw error;
    }
}

// For standalone execution
async function main() {
    try {
        await seedOrders();
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}