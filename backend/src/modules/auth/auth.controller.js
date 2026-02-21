const authService = require('./auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Call the service to handle the database logic
    const result = await authService.loginUser(email, password);

    // Send successful response to frontend
    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { login };