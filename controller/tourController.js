const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModels');
const factory = require('./../controller/factoryController');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(false, 'Not an Image! please upload only image.');
  }
};

const upload = multer({ Storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single() req.file
// upload.array([]) req.files

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }

  console.log(req.body.images);
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.UpdateTour = factory.UpdateDoc(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStats: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'ml' ? distance / 3963.2 : distance / 6378.1;

  if (!lng || !lat) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.calcDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'ml' ? 0.000621371 : 0.001;

  if (!lng || !lat) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

// exports.getAllTours = catchAsync(async (req, res, next) => {
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');
// console.log(req.query);

//////// FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// let query = Tour.find(JSON.parse(queryStr));

/////// SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log(sortBy);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

/////// FIELDS
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

///// PAGE
// const limit = req.query.limit || 100;
// const skip = (req.query.page - 1) * limit || 0;
// query = query.skip(+skip).limit(+limit);

//   const tours = await query;
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
