const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();
// router.param('id', checkId);
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(authController.protect, tourController.getMonthlyPlan);
router
  .route('/tours-stats')
  .get(authController.protect, tourController.getTourStats);

router
  .route('/tours-within/:distance/centre/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.calcDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'guild'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.UpdateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guild'),
    tourController.deleteTour,
  );

module.exports = router;
