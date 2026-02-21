const swapService = require('./swap.service');

const requestSwap = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requesting_lecturer_id: req.user.id
    };
    const result = await swapService.createSwapRequest(requestData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyPendingSwaps = async (req, res) => {
  try {
    let swaps;
    if (req.user.role === 'hod') {
      swaps = await swapService.getPendingSwapsForHOD();
    } else if (req.user.role === 'lecturer') {
      swaps = await swapService.getPendingSwapsForLecturer(req.user.id);
    }
    res.status(200).json(swaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToSwap = async (req, res) => {
  try {
    const { swapId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const result = await swapService.updateSwapStatus(swapId, req.user.role, status);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { requestSwap, getMyPendingSwaps, respondToSwap };