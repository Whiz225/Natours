const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  userAccount,
  updateUserData,
  getMyTours,
} = require('../controller/viewController');
const { isLoggedIn, protect } = require('../controller/authController');
const { createBookingCheckout } = require('../controller/bookingController');

const router = express.Router();

router.get('/me', protect, userAccount);
router.post('/user-update-data', protect, updateUserData);
router.get('/my-tours', protect, getMyTours);

router.use(isLoggedIn);

router.get('/', createBookingCheckout, getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
