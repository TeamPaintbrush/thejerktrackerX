import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    console.log('Admin user credentials:');
    console.log('Email: admin@thejerktracker.com');
    console.log('Password: admin123');
    console.log('Hashed Password:', hashedPassword);
    console.log('');
    console.log('To create the admin user manually, add this to localStorage key "jerktracker_users":');
    console.log(JSON.stringify([{
      id: Date.now().toString(),
      name: 'Admin User',
      email: 'admin@thejerktracker.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    }], null, 2));
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();