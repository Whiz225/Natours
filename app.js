const path = require('path');

const viewRouter = require('./routes/viewRoute');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const bookingRouter = require('./routes/bookingRoute');
const reviewRouter = require('./routes/reviewRoute');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/AppError');

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving static fills
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(helmet());
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit request from same API to prevent abuse
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again in an hour!',
});

app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
// Prevent duplicate parameter attacks
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
    ],
  }),
);

app.use(compression());

// Text middlewave
app.use((req, res, next) => {
  req.createdAt = Date.now().toLocaleString();
  // console.log(req.cookies);
  next();
});

// API Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', postTour);
// app.patch('/api/v1/tours/:id', patchtour);
// app.delete('/api/v1/tours/:id', deleteTour);
