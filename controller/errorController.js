const AppError = require('../utils/AppError');

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
      // message: `INVALID ${err.path}: ${err.value}`,
    });

  return res.status(200).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    if (req.originalUrl.startsWith('/api'))
      return res.status(err.statusCode).json({
        status: err.status,
        message: `ERROR 🔥💥: ${err.message}`,
      });
    // programming or other unknown error: don't leak error details

    console.log('ERROR 💥💥💥💥💥', err);
    return res.status(500).render('error', {
      title: 'Something went wrong!',
      // msg: `ERROR 🔥💥💥💥💥💥: Something went very wrong!`,
      msg: `ERROR 🔥💥: ${err.message}`,
    });
  }

  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      message: `ERROR 🔥💥: ${err.message}`,
    });
  // programming or other unknown error: don't leak error details

  console.log('ERROR 💥💥💥💥💥', err);
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: `ERROR 🔥💥💥💥💥💥: Something went very wrong!`,
  });
};

const handleMongoError = () => {
  return new AppError(`INVALID ${err.path}: ${err.value}.`, 400);
};

const handleCastErrorDB = (err) => {
  return new AppError(`INVALID ${err.path}: ${err.value}.`, 400);

  // const errors = Object.values(err.errors).map((el) => el.message);

  // return new AppError(`INVALID INPUT DATA:${errors.join('. ')}`, 400);
};

const handleValidationErrorDB = (err) => {
  // return new AppError(`INVALID ${err.path}: ${err.value}.`, 400);

  const errors = Object.values(err.errors).map((el) => el.message);

  return new AppError(`INVALID INPUT DATA:${errors.join('. ')}`, 400);
};

const handleJWTError = () => {
  return new AppError(`INVALID TOKEN. PLEASE LOGIN AGAIN!.`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError(`YOUR TOKEN HAS EXPIRED. PLEASE LOGIN AGAIN!.`, 401);
};

module.exports = (err, req, res, next) => {
  // console.log('ERROR......:', err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // if (error.err.code === 11000) error = handleMongoError(err);
  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === 'production') sendErrorProd(err, req, res);
};
