const { JsonWebTokenError } = require("jsonwebtoken");
const user = require("../models/user");
const ErrorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
exports.isAuthenticatedUser = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    new ErrorHandler("please user must be login", 401);
    next();
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  user
    .findById(decodedData.id)
    .then((data) => {
      if (!data) {
        new ErrorHandler("invalid user", 401);
        next();
      }
      req.user = data;
      next();
    })
    .catch((err) => {
      new ErrorHandler("invalid token", 500);
      next();
    });
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};


