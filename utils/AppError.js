class AppError extends Error {
  constructor(message, statusCode) {
    // console.log('code.........', statusCode);
    // console.log('message.........', message);
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constuctor);
  }
}

module.exports = AppError;
