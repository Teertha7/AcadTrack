const bcrypt = require('bcrypt');
const authRepo = require('../repositories/authRepository');
const { generateAccessToken, generateRefreshToken, hashRefreshToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = 12;
const REFRESH_EXPIRES_DAYS = 7;

const login = async (email, password, role) => {
  let user = null;

  if (role === 'admin') user = await authRepo.findAdminByEmail(email);
  else if (role === 'faculty') user = await authRepo.findFacultyByEmail(email);
  else if (role === 'student') user = await authRepo.findStudentByEmail(email);

  if (!user) throw new AppError('Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new AppError('Invalid credentials', 401);

  const payload = { id: user.id, email: user.email, role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  await authRepo.storeRefreshToken(user.id, role, tokenHash, expiresAt);

  const { password_hash, ...safeUser } = user;

  return { accessToken, refreshToken, user: { ...safeUser, role } };
};

const refresh = async (refreshToken, role) => {
  if (!refreshToken) throw new AppError('Refresh token is required', 401);

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await authRepo.findRefreshToken(tokenHash, role);
  if (!stored) throw new AppError('Invalid or expired refresh token', 401);

  const payload = { id: stored.user_id, role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken();
  const newHash = hashRefreshToken(newRefreshToken);

  await authRepo.revokeRefreshToken(tokenHash);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
  await authRepo.storeRefreshToken(stored.user_id, role, newHash, expiresAt);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken, role) => {
  if (!refreshToken) return;
  const tokenHash = hashRefreshToken(refreshToken);
  await authRepo.revokeRefreshToken(tokenHash);
};

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

module.exports = { login, refresh, logout, hashPassword };
