const express = require('express');

const { protect, restrictTo } = require('./../controller/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  setTourUserId,
  updateReview,
  getReview,
} = require('../controller/reviewcontroller');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserId, createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
