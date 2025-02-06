module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
    //   if (err.name === 'CastError')
    //     return res.status(404).json({
    //       status: 'fail',
    //       message: `INVALID ${err.path}: ${err.value}`,
    //     });

    //   res.status(404).json({
    //     status: 'fail',
    //     // message: err,
    //     message: `ERROR 🔥💥: ${err}`,
    //   });
    // });
  };
};
