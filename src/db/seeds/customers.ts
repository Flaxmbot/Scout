import { db } from '@/db';
import { customers } from '@/db/schema';

async function main() {
    const sampleCustomers = [
        {
            email: 'alice.johnson@example.com',
            name: 'Alice Johnson',
            phone: '+1-555-123-4567',
            address: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            createdAt: new Date('2023-10-01T10:00:00Z').toISOString(),
            updatedAt: new Date('2023-10-01T10:00:00Z').toISOString(),
        },
        {
            email: 'bob.williams@webmail.com',
            name: 'Bob Williams',
            phone: '+1-555-987-6543',
            address: {
                street: '45 Oak Ave',
                city: 'Centerville',
                state: 'CA',
                zip: '90210',
                country: 'USA'
            },
            createdAt: new Date('2023-10-15T11:30:00Z').toISOString(),
            updatedAt: new Date('2023-10-15T11:30:00Z').toISOString(),
        },
        {
            email: 'carol.davis@outlook.com',
            name: 'Carol Davis',
            phone: '+44-20-7123-4567',
            address: {
                street: '78 London Rd',
                city: 'London',
                state: 'ENG', // Standard for UK, though not always used formally
                zip: 'SW1A 0AA',
                country: 'UK'
            },
            createdAt: new Date('2023-10-20T14:45:00Z').toISOString(),
            updatedAt: new Date('2023-10-20T14:45:00Z').toISOString(),
        },
        {
            email: 'david.miller@company.org',
            name: 'David Miller',
            phone: '+1-555-222-3333',
            address: {
                street: '99 Pine Ln',
                city: 'Springfield',
                state: 'IL',
                zip: '62704',
                country: 'USA'
            },
            createdAt: new Date('2023-11-05T09:15:00Z').toISOString(),
            updatedAt: new Date('2023-11-05T09:15:00Z').toISOString(),
        },
        {
            email: 'eve.morris@gmail.com',
            name: 'Eve Morris',
            phone: '+61-2-9876-5432',
            address: {
                street: '10 George St',
                city: 'Sydney',
                state: 'NSW',
                zip: '2000',
                country: 'Australia'
            },
            createdAt: new Date('2023-11-10T16:00:00Z').toISOString(),
            updatedAt: new Date('2023-11-10T16:00:00Z').toISOString(),
        },
        {
            email: 'frank.green@yahoo.com',
            name: 'Frank Green',
            phone: '+1-555-444-5555',
            address: {
                street: '321 River Rd',
                city: 'Riverside',
                state: 'TX',
                zip: '75001',
                country: 'USA'
            },
            createdAt: new Date('2023-11-25T08:00:00Z').toISOString(),
            updatedAt: new Date('2023-11-25T08:00:00Z').toISOString(),
        },
        {
            email: 'grace.hall@mail.net',
            name: 'Grace Hall',
            phone: '+33-1-23-45-67-89',
            address: {
                street: '5 Rue de la Paix',
                city: 'Paris',
                state: 'IDF',
                zip: '75002',
                country: 'France'
            },
            createdAt: new Date('2023-12-01T13:00:00Z').toISOString(),
            updatedAt: new Date('2023-12-01T13:00:00Z').toISOString(),
        },
        {
            email: 'henry.king@gmail.com',
            name: 'Henry King',
            phone: '+1-555-666-7777',
            address: {
                street: '88 Hill St',
                city: 'Hillview',
                state: 'GA',
                zip: '30303',
                country: 'USA'
            },
            createdAt: new Date('2023-12-10T09:00:00Z').toISOString(),
            updatedAt: new Date('2023-12-10T09:00:00Z').toISOString(),
        },
        {
            email: 'isabel.lee@company.co.jp',
            name: 'Isabel Lee',
            phone: '+81-3-1234-5678',
            address: {
                street: '4-2 Marunouchi',
                city: 'Chiyoda',
                state: 'Tokyo',
                zip: '100-0005',
                country: 'Japan'
            },
            createdAt: new Date('2023-12-20T17:00:00Z').toISOString(),
            updatedAt: new Date('2023-12-20T17:00:00Z').toISOString(),
        },
        {
            email: 'jack.wright@hotmail.com',
            name: 'Jack Wright',
            phone: '+1-555-888-9999',
            address: {
                street: '77 Ocean Dr',
                city: 'Seaside',
                state: 'FL',
                zip: '33101',
                country: 'USA'
            },
            createdAt: new Date('2024-01-05T10:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-05T10:00:00Z').toISOString(),
        },
        {
            email: 'kim.park@gmail.com',
            name: 'Kim Park',
            phone: '+82-2-9876-5432',
            address: {
                street: 'Gangnam-daero 396',
                city: 'Gangnam-gu',
                state: 'Seoul',
                zip: '06132',
                country: 'South Korea'
            },
            createdAt: new Date('2024-01-15T11:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
        },
        {
            email: 'liam.chen@techcorp.com',
            name: 'Liam Chen',
            phone: '+86-10-8765-4321',
            address: {
                street: 'Chaoyangmen Outer St',
                city: 'Chaoyang',
                state: 'Beijing',
                zip: '100020',
                country: 'China'
            },
            createdAt: new Date('2024-01-20T14:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T14:00:00Z').toISOString(),
        },
        {
            email: 'mia.nguyen@yahoo.com',
            name: 'Mia Nguyen',
            phone: '+84-28-1234-5678',
            address: {
                street: 'Nguyen Hue Street',
                city: 'Ho Chi Minh City',
                state: 'HCM',
                zip: '70000',
                country: 'Vietnam'
            },
            createdAt: new Date('2024-02-01T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-02-01T09:00:00Z').toISOString(),
        },
        {
            email: 'noah.patel@gmail.com',
            name: 'Noah Patel',
            phone: '+91-11-2345-6789',
            address: {
                street: 'Connaught Place',
                city: 'New Delhi',
                state: 'DL',
                zip: '110001',
                country: 'India'
            },
            createdAt: new Date('2024-02-10T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-02-10T12:00:00Z').toISOString(),
        },
        {
            email: 'olivia.rossi@outlook.com',
            name: 'Olivia Rossi',
            phone: '+39-06-1234-5678',
            address: {
                street: 'Via del Corso 150',
                city: 'Rome',
                state: 'RM',
                zip: '00186',
                country: 'Italy'
            },
            createdAt: new Date('2024-02-25T15:00:00Z').toISOString(),
            updatedAt: new Date('2024-02-25T15:00:00Z').toISOString(),
        },
    ];

    await db.insert(customers).values(sampleCustomers);
    
    console.log('✅ Customers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});