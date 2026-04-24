const analyticsRepo = require('../repositories/analyticsRepository');

const getAdminStats = async (req, res, next) => {
  try {
    const data = await analyticsRepo.getAdminStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAdminStats };
