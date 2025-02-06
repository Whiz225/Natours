const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../controller/factoryController');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: 1000,
    recurring: {
      interval: 'month',
    },
    product_data: {
      name: `${tour.name} Tour`,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&&user=${req.user.id}&&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    phone_number_collection: {
      enabled: true,
    },
    // invoice_creation: {
    //   enabled: true,
    //   invoice_data: {
    //     description: tour.summary,
    //   },
    // },
    line_items: [
      {
        // name: `${tour.name} Tour`,
        // description: tour.summary,
        // images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
        // price: price.id,
        // amount: tour.price * 100,
        // currency: 'usd',
        price: price.id,
        quantity: 2,
      },
    ],
    mode: 'subscription',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { user, tour, price } = req.query;

  if (!user && !tour && !price) return next();

  await Booking.create({ user, tour, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getBooking = factory.getOne(Booking);
exports.CreateBooking = factory.createOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.UpdateDoc(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
