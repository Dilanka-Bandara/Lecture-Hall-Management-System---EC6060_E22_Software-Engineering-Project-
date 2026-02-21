const systemService = require('./system.service');

const fetchAllSystemData = async (req, res) => {
  try {
    const data = await systemService.getSystemData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchAllSystemData };