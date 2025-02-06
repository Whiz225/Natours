const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: [true, 'Please provide your name'],
  },
  email: {
    type: 'string',
    validate: [validator.isEmail, ' Please provide your valid email'],
    unique: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: 'string',
    enum: ['user', 'admin', 'lead-guild', 'guild'],
    default: 'user',
  },
  password: {
    type: 'string',
    required: [true, 'Please put your password'],
    minlength: [8, 'password should not be less down 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: 'string',
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE or SAVE!!!
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: 'string',
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword,
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      Date.now(this.passwordChangedAt / 1000),
      10,
    );
    return passwordChangedTime < JWTTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
