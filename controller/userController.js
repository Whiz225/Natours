const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModels');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../controller/factoryController');

// // Disk storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only image.', 400), false);
  }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const reqObj = (obj, options) => {
  const x = options.join(' ');
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (x.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password update. Please use the updatePassword button',
        400,
      ),
    );
  const filteredObj = reqObj(req.body, ['name', 'email']);
  if (req.file) filteredObj.photo = req.file.filename;

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    filteredObj,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true, runValidators: true },
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
exports.getAllUser = factory.getAll(User);
exports.updateUser = factory.UpdateDoc(User);
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined!. Please use /singup instead',
  });
};
