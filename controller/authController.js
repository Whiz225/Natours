const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const User = require('./../models/userModels');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const singToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN + 1 * 10 * 1000}`,
  });
};

const creatSendToken = (user, statusCode, res) => {
  const token = singToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.singUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  });

  await new Email(
    newUser,
    `${req.protocol}://${req.get('host')}/me`,
  ).sendWelcome();

  creatSendToken(newUser, 201, res);
});

exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'Logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide your email and password'), 400);

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  creatSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  // 2) verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) check if user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  // 4) check if user changed password after the JWT token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }
  res.locals.user = user;
  req.user = user;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1) getting token and check if it's there
    if (req.cookies.jwt) {
      const token = req.cookies.jwt;

      if (!token) return next();
      // 2) verification of token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
      );

      // 3) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();
      // 4) check if user changed password after the JWT token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.restrictTo = (...roles) => {
  return function (req, res, next) {
    console.log(req.user.role);
    if (!roles.join(' ').includes(req.user.role))
      return next(
        new AppError('Your are not permitted to perform this action!', 403),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body;
  const user = await User.findOne(email);
  if (!user) {
    return next(
      new AppError('Incorrect email address! Please provide your email.', 404),
    );
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 mins)',
    //   message,
    // });

    new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    // await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError('No user! or The Token has expired!', 404));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save({ validateBeforeSave: false });

  creatSendToken(user, 203, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, newPasswordConfirm } = req.body;
  if (!password || !newPassword || !newPasswordConfirm)
    return next(new AppError('Please provide your details.', 404));

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new AppError('No user....', 404));

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password! Please try again.', 404));
  }
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  creatSendToken(user, 203, res);
});
