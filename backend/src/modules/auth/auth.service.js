const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (email, password) => {
  // 1. Find the user in the database
  const user = await db('users').where({ email }).first();

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Check the password securely using bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3. Generate the Security Token
  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      university_id: user.university_id, // <-- ADDED MISSING COMMA HERE
      name: user.name,                   // <-- ADDED THIS
      batch: user.batch                  // <-- ADDED THIS
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' } // Token expires in 8 hours
  );

  // 4. Return user data (excluding password) and the token
  delete user.password_hash;
  
  return {
    user,
    token
  };
};

module.exports = { loginUser };