const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
  return await db('users').select('id', 'name', 'email', 'university_id', 'role', 'batch').orderBy('role');
};

const createUser = async (userData) => {
  // Hash the password before saving (using a default password for new accounts)
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);
  
  const [newUserId] = await db('users').insert({ ...userData, password_hash });
  return { id: newUserId, ...userData };
};

const getAllHalls = async () => {
  return await db('lecture_halls').select('*');
};

const createHall = async (hallData) => {
  const [newHallId] = await db('lecture_halls').insert(hallData);
  return { id: newHallId, ...hallData };
};

module.exports = { getAllUsers, createUser, getAllHalls, createHall };