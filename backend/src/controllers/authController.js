const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken, role } = req.body;
    const tokens = await authService.refresh(refreshToken, role);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken, role } = req.body;
    await authService.logout(refreshToken, role);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

module.exports = { login, refresh, logout, me };
