const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statuscode = err.statuscode || 500;
  err.message = err.message || " internal server error";
  if (err.message.includes("E11000")) {
    err.message = "duplicate error";
  }
  res.status(err.statuscode).json({
    success: false,
    message: err.message,
  });
};
