const express = require('express');
const {
  getCheckoutSession,
  getAllBooking,
  CreateBooking,
  updateBooking,
  getBooking,
  deleteBooking,
} = require('../controller/bookingController');
const { protect, restrictTo } = require('../controller/authController');

const router = express.Router();

router.use(protect);
router.route('/checkout-session/:tourId').get(getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBooking).post(CreateBooking);
router.route('/:id').patch(updateBooking).get(getBooking).delete(deleteBooking);

module.exports = router;
