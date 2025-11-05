require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM system_users WHERE username = ?',
      ['sysadmin']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    const userId = uuidv4();
    await pool.execute(
      'INSERT INTO system_users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [userId, 'sysadmin', hashedPassword, 'admin']
    );

    console.log('Admin user created successfully');
    console.log('Username: sysadmin');
    console.log('Password: password123');
    console.log('Please change the password after first login');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await pool.end();
    process.exit(0);
  }
};

// Run the script
createAdmin(); 