const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');
    
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ User already exists!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Name:', name);
      console.log('\n🔗 You can now login with:');
      console.log('POST http://localhost:5000/api/user/login');
      console.log('Body: { "email": "test@example.com", "password": "password123" }');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const userId = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, email, password_hash, name, role, is_active, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'user', true, false]
    );
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);
    console.log('🆔 User ID:', userId);
    
    console.log('\n🔗 You can now login with:');
    console.log('POST http://localhost:5000/api/user/login');
    console.log('Body: { "email": "test@example.com", "password": "password123" }');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createTestUser();
