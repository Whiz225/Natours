const express = require('express');
const authController = require('./../controller/authController');
const userController = require('./../controller/userController');

const router = express.Router();

router.post('/singup', authController.singUp);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);

router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);
router.route('/me').get(userController.getMe, userController.getUser);

router.patch('/updatepassword', authController.updatePassword);
router.patch(
  '/updateMyData',
  // authController.restrictTo('user', 'admin'),
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete(
  '/deleteMe',
  authController.restrictTo('user'),
  userController.deleteMe,
);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'guild', 'lead-guild'),
    userController.getAllUser,
  )
  .post(authController.restrictTo('admin'), userController.createUser);
router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUser)
  .patch(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

// There's problem with updateUser

module.exports = router;
