const adminService = require('./admin.service');

const getUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user. Ensure Email and University ID are unique.' });
  }
};

const getHalls = async (req, res) => {
  try {
    const halls = await adminService.getAllHalls();
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addHall = async (req, res) => {
  try {
    const hall = await adminService.createHall(req.body);
    res.status(201).json({ message: 'Hall created successfully', hall });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hall.' });
  }
};

module.exports = { getUsers, addUser, getHalls, addHall };