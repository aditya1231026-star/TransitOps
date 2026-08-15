import User from '../models/userModel.js';

/**
 * Seed a default admin user if no users exist in the database
 */
export const seedDefaultAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('⚡ No users found in database. Seeding default admin user...');
      
      const adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@transitops.com',
        password: 'AdminPassword123',
        role: 'admin',
      });
      
      console.log(`✓ Default admin user seeded successfully: ${adminUser.email}`);
    } else {
      console.log('✓ Database already contains user data. Skipping seeder.');
    }
  } catch (error) {
    console.error(`✗ Error seeding default admin user: ${error.message}`);
  }
};
