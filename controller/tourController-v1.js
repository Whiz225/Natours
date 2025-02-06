const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`./dev-data/data/tours-simple.json`, 'utf-8'),
);

exports.checkId = (req, res, next, val) => {
  // const { id } = req.params;
  if (val > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      data: 'INVALID_ID',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      createdAt: req.createdAt,
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    status: 'success',
    data: {
      tours: [tours[id]],
    },
  });
};

exports.postTour = (req, res) => {
  const newID = { id: tours[tours.length - 1].id + 1 };
  const newTour = Object.assign(newID, req.body);
  tours.push(newTour);

  fs.writeFile(
    `./dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    () => console.log('Added...'),
  );

  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
};

exports.patchTour = (req, res) => {
  const { id } = req.params;

  res.status(202).json({
    status: 'success',
    data: 'Updated...',
  });
};

exports.deleteTour = (req, res) => {
  const { id } = req.params;

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
