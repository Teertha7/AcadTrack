class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const createError = (message, statusCode, errors = null) =>
  new AppError(message, statusCode, errors);

module.exports = { AppError, createError };
