require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function setupDemoUsers() {
    try {
        console.log('🔧 Setting up demo users...');
        
        const users = [
            {
                id: 1,
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                email: 'admin@police.gov',
                role: 'admin',
                department: 'Headquarters',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                username: 'officer1',
                password: await bcrypt.hash('officer123', 10),
                email: 'officer1@police.gov',
                role: 'officer',
                department: 'District 1',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                username: 'officer2',
                password: await bcrypt.hash('officer123', 10),
                email: 'officer2@police.gov',
                role: 'officer',
                department: 'District 2',
                created_at: new Date().toISOString()
            }
        ];

        const dataPath = path.join(__dirname, 'data');
        
        // Ensure data directory exists
        try {
            await fs.access(dataPath);
        } catch {
            await fs.mkdir(dataPath, { recursive: true });
        }

        // Save users
        await fs.writeFile(
            path.join(dataPath, 'users.json'),
            JSON.stringify(users, null, 2)
        );

        console.log('✅ Demo users created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:    admin / admin123');
        console.log('   Officer1: officer1 / officer123');
        console.log('   Officer2: officer2 / officer123');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setupDemoUsers();